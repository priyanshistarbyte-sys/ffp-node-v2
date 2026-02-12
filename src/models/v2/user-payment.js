const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');
const sms_helper = require('@/helper/sms-helper');

exports.userPurchasePackage = async (
    user_id,
    amount,
    transactionid,
    status,
    packageid,
    other = {}
) => {
    try {

        /*  Get plan */
        const [plans] = await db.query(
            queryHelper.select(
                'id, plan_name, duration, duration_type, price, discount_price, is_free',
                'subscription_plans',
                { id: packageid },
                '',
                1
            )
        );

        if (!plans.length) {
            return { status: false, message: 'Invalid plan' };
        }

        const plan = plans[0];
        let finalPrice = plan.discount_price ?? plan.price;

        /* 1. Apply coupon code  */
        let couponBonusDays = 0;
        if (other.coupon_code) {
            const [coupons] = await db.query(
                queryHelper.select(
                    'id, code, total_qty, start_date, end_date, total_days, status',
                    'coupon_code',
                    { code: other.coupon_code },
                    '',
                    1
                )
            );

            if (!coupons.length) {
                return { status: false, message: 'Invalid coupon code' };
            }

            const coupon = coupons[0];

            if (Number(coupon.status) !== 1) {
                return { status: false, message: 'Coupon code is inactive' };
            }

            const today = new Date();
            const startDate = new Date(coupon.start_date);
            const endDate = new Date(coupon.end_date);

            if (today < startDate || today > endDate) {
                return { status: false, message: 'Coupon code expired or not yet valid' };
            }

            const [usageCount] = await db.query(
                `SELECT COUNT(*) as count FROM coupon_code_appy_user WHERE coupon_id = ?`,
                [coupon.id]
            );

            if (usageCount[0].count >= coupon.total_qty) {
                return { status: false, message: 'Coupon usage limit reached' };
            }

            const [userUsed] = await db.query(
                queryHelper.select(
                    'id',
                    'coupon_code_appy_user',
                    { user_id, coupon_id: coupon.id },
                    '',
                    1
                )
            );

            if (userUsed.length) {
                return { status: false, message: 'Coupon already used by this user' };
            }

            couponBonusDays = parseInt(coupon.total_days, 10) || 0;
            other.coupon_id = coupon.id;
        }

        /*  Prevent duplicate transaction */
        if (transactionid) {
            const [dup] = await db.query(
                queryHelper.select('id', 'payments', { transactionid })
            );
            if (dup.length) {
                return { status: false, message: 'Duplicate transaction' };
            }
        }

        /* Free trial restriction */
        if (Number(plan.is_free) === 0) {
            const [trialUsed] = await db.query(`
                SELECT p.id
                FROM payments p
                INNER JOIN subscription_plans sp ON sp.id = p.packageid
                WHERE p.user_id = ?
                  AND sp.is_free = 0
                LIMIT 1
            `, [user_id]);

            if (trialUsed.length) {
                return { status: false, message: 'Free trial already used' };
            }
        }

        /* Get admin data */
        const [adminRows] = await db.query(
            queryHelper.select(
                'expdate, referral_code',
                'admin',
                { id: user_id },
                '',
                1
            )
        );

        let expiry = new Date();

        if (
            adminRows.length &&
            adminRows[0].expdate &&
            new Date(adminRows[0].expdate) > new Date()
        ) {
            expiry = new Date(adminRows[0].expdate);
        }

        /* 5️⃣ Apply plan duration */
        const duration = parseInt(plan.duration, 10);

        switch (plan.duration_type) {
            case 'day':
                expiry.setDate(expiry.getDate() + duration);
                break;
            case 'month':
                expiry.setMonth(expiry.getMonth() + duration);
                break;
            case 'year':
                expiry.setFullYear(expiry.getFullYear() + duration);
                break;
        }

        /* 5.Add coupon bonus days */
        if (couponBonusDays > 0) {
            expiry.setDate(expiry.getDate() + couponBonusDays);
        }

        /* Referral bonus (ONLY expiry update) */
        if (Number(plan.is_free) === 1 && adminRows[0]?.referral_code) {

            const refCode = adminRows[0].referral_code;

            const [refPaid] = await db.query(`
                SELECT p.id
                FROM payments p
                INNER JOIN subscription_plans sp ON sp.id = p.packageid
                WHERE p.referral_code = ?
                  AND sp.is_free = 1
                LIMIT 1
            `, [refCode]);

            if (refPaid.length) {

                const [bonusGiven] = await db.query(`
                    SELECT id
                    FROM referral_bonus
                    WHERE user_id = ?
                    LIMIT 1
                `, [user_id]);

                if (!bonusGiven.length) {
                    expiry.setMonth(expiry.getMonth() + 1);

                    // optional tracking (recommended)
                    await db.query(
                        queryHelper.insert('referral_bonus', {
                            user_id,
                            created_at: config.CURRENT_DATE()
                        })
                    );
                }
            }
        }

        /* Update admin */
        await db.query(
            queryHelper.update('admin', {
                ispaid: Number(plan.is_free) === 1 ? '1' : '0',
                planStatus: Number(plan.is_free) === 1 ? 2 : 1,
                expdate: commonHelper.formatDate(expiry),
                status: '1'
            }, { id: user_id })
        );

        /* Insert payment (ONLY ONE ROW) */
        await db.query(
            queryHelper.insert('payments', {
                user_id,
                amount,
                date: config.ONLY_DATE(),
                transactionid,
                status: plan.plan_name,
                packageid: plan.id,
                price: finalPrice,
                referral_code: other.referral_code || null,
                created_at: config.CURRENT_DATE()
            })
        );

        /* 8.Record coupon usage */
        if (other.coupon_id) {
            await db.query(
                queryHelper.insert('coupon_code_appy_user', {
                    user_id,
                    coupon_id: other.coupon_id,
                    created_at: config.CURRENT_DATE()
                })
            );
        }

        /*  SMS */
        const [mobile] = await db.query(
            queryHelper.select('mobile', 'admin', { id: user_id }, '', 1)
        );

        if (mobile.length) {
            sms_helper.sms.send_other_sms(
                mobile[0].mobile,
                'buy',
                `${plan.duration} ${plan.duration_type}`
            );
        }

        return {
            status: true,
            message: 'Transaction Successful'
        };

    } catch (err) {
        console.error('Payment Error:', err);
        return { status: false, message: 'Something went wrong' };
    }
};
