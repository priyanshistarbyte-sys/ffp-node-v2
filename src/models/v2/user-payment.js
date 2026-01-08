const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');
const sms_helper = require('@/helper/sms-helper');

exports.userPurchasePackage = async (user_id,amount,transactionid,status,packageid,other = {}) => {

    let responseJson = { status: true, message: "" };

    /* ----------------------------------------
       Get Subscription Plan Details
    -----------------------------------------*/
    const subscriptionPlan = await db.query(
        queryHelper.select(
            'id, plan_name, duration, duration_type, price, is_free',
            'subscription_plans',
            { id: packageid },
            '',
            1
        )
    );

    if (!subscriptionPlan || subscriptionPlan.length === 0) {
        return {
            status: false,
            message: 'Invalid subscription plan'
        };
    }

    const plan = subscriptionPlan[0];

    /* ----------------------------------------
       Check User Previous Plans (Trial Used?)
    -----------------------------------------*/
    const userOldPlans = await db.query(
        queryHelper.select(
            'id',
            'payments',
            { user_id: user_id }
        )
    );

    if (userOldPlans.length > 0 && plan.is_free == 1) {
        return {
            status: false,
            message: 'Sorry, You are not eligible for a trial plan. Thank you'
        };
    }

    /* ----------------------------------------
       Get User Current Plan Status
    -----------------------------------------*/
    const userPlanData = await db.query(
        queryHelper.select(
            'planStatus, ispaid, expdate',
            'admin',
            { id: user_id },
            'id ASC',
            1
        )
    );

    let planStatus = 1; // trial
    let expiryDate = new Date();

    if (
        userPlanData.length > 0 &&
        userPlanData[0].planStatus == 2 &&
        userPlanData[0].ispaid == 1 &&
        new Date(userPlanData[0].expdate) > new Date()
    ) {
        expiryDate = new Date(userPlanData[0].expdate);
    }

    /* ----------------------------------------
       Calculate Expiry Date
    -----------------------------------------*/
    if (plan.is_free == 1) {
        // Trial plan → 7 days
        expiryDate.setDate(expiryDate.getDate() + 7);
        planStatus = 1;
    } else {
        const duration = parseInt(plan.duration);

        switch (plan.duration_type) {
            case 'day':
                expiryDate.setDate(expiryDate.getDate() + duration);
                break;

            case 'month':
                expiryDate.setMonth(expiryDate.getMonth() + duration);
                break;

            case 'year':
                expiryDate.setFullYear(expiryDate.getFullYear() + duration);
                break;

            default:
                return {
                    status: false,
                    message: 'Invalid plan duration type'
                };
        }

        planStatus = 2; // paid plan
    }

    /* ----------------------------------------
       Update User Subscription
    -----------------------------------------*/
    const userPaidData = {
        ispaid: "1",
        expdate: commonHelper.formatDate(expiryDate),
        planStatus: planStatus,
        status: "1"
    };

    /* ----------------------------------------
       Prepare Payment Log
    -----------------------------------------*/
    const paymentLog = {
        user_id: user_id,
        amount: amount,
        date: config.ONLY_DATE(),
        transactionid: transactionid,
        status: status,
        packageid: packageid,
        price: plan.price,
        duration: plan.duration,
        duration_type: plan.duration_type,
        referral_code: other.referral_code || null,
        created_at: config.CURRENT_DATE()
    };

    /* ----------------------------------------
       Handle Trial vs Paid Payment
    -----------------------------------------*/
    if (plan.is_free == 1) {

        await db.query(
            queryHelper.update('admin', userPaidData, { id: user_id })
        );

        await db.query(
            queryHelper.insert('payments', paymentLog)
        );

    } else {

        /* Prevent duplicate transaction */
        const duplicateTxn = await db.query(
            queryHelper.select(
                'id',
                'payments',
                { transactionid: transactionid }
            )
        );

        if (duplicateTxn.length === 0) {

            await db.query(
                queryHelper.update('admin', userPaidData, { id: user_id })
            );

            await db.query(
                queryHelper.insert('payments', paymentLog)
            );

            /* Send SMS */
            const userMobile = await db.query(
                queryHelper.select(
                    'mobile',
                    'admin',
                    { id: user_id },
                    '',
                    1
                )
            );

            if (userMobile.length > 0) {
                sms_helper.sms.send_other_sms(
                    userMobile[0].mobile,
                    "buy",
                    `${plan.duration} ${plan.duration_type}`
                );

                await db.query(
                    "DELETE FROM webhook_failed WHERE mobile = '" + userMobile[0].mobile + "'"
                );
            }
        }
    }

    /* ----------------------------------------
       Update Paid User Counter
    -----------------------------------------*/
    await db.query(
        "UPDATE counter SET paidUser = paidUser + 1"
    );

    return {
        status: true,
        message: "Transaction Successfully!"
    };
};
