const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');
const sms_helper = require('@/helper/sms-helper');
var md5 = require('md5');

exports.userLogin = (mobile,password,contryCode) => {
    var where ={ mobile:mobile,password:md5(password+config.SALT),role:'User' };
    return db.query(
        queryHelper.select(
            'id,name,business_name,photo,mobile,email,b_email,b_mobile2,b_website,ispaid,expdate,planStatus,gender,address,status,note,last_login,created_at,updated_at',
            'admin',
            where,"",
            1
        )
    );
}

exports.getPaymentData = async (user_id) => {
    var where ={ user_id:user_id };
    var foPaymentsList = await db.query(
        queryHelper.select(
            'id,user_id,amount,date,transactionid,status,packageid,price,month,created_at',
            'payments',
            where,"id desc"
        )
    );

    var foPayments = [];
    if(foPaymentsList.length > 0){
        foPaymentsList.forEach(foSingleElement => {
            foSingleElement.date = foSingleElement.date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.date,'d/F/Y'):'';
            foPayments.push(foSingleElement);
        });
    }

    return foPayments;
}


exports.updateLastLogin = async (user_id) => {
    var where ={ id:user_id };
    var update_data = { last_login : config.CURRENT_DATE() }
    await db.query(
        queryHelper.update('admin',update_data,where)
    );
    return true;
}

exports.checkIsMobileExist = async (mobile) => {
    var where ={ mobile:mobile,role:'User'};
    var foUser = await db.query(
        queryHelper.select(
            'id',
            'admin',
            where,"",
            1
        )
    );
    const users = Array.isArray(foUser[0]) ? foUser[0] : foUser;
    return users.length > 0;
}

exports.updatePassword = async (mobile,new_pass) => {
    var where ={ mobile:mobile, 'role':'User' };
    var update_data = { updated_at : config.CURRENT_DATE(),password:new_pass };

    await db.query(
        queryHelper.update('admin',update_data,where)
    );
    return true;
}
exports.smsLogUpdate = async (type,mobile,otp) => {
    var insertData = await db.query(
        queryHelper.insert(
            'sms_log',
            {
                'date':config.ONLY_DATE(),
                'type': type,
                'mobile': mobile,
                'otp': otp,
                'created_at': config.CURRENT_DATE()
            }
        )
    );
    return true;
}

exports.userRegister = async (request_body) => {
    // Generate 6-digit alphanumeric referral code
    const generateReferralCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const referralCode = generateReferralCode();

    var insertData = await db.query(
        queryHelper.insert(
            'admin',
            {
                'name':"",
                'business_name':"",
                'photo':"",
                'mobile': request_body.mobile,
                'password': md5(request_body.password+config.SALT),
                'email': "",
                'b_mobile2': "",
                'b_email': "",
                'b_website': "",
                'gender': 1,
                'address': "",
                'role': 'User',
                'status': 1,
                'ispaid': 0,
                'expdate': null,
                'planStatus': null,
                'referral_code': referralCode,
                'used_referral_code': request_body.referral_code || null,
                'created_at': config.CURRENT_DATE(),
                'updated_at': config.CURRENT_DATE()
            }
        )
    );
    var insertId = insertData.insertId || (insertData[0] && insertData[0].insertId) || 0;
    if(insertId > 0){
        console.log('sandip------register', request_body.mobile);
        sms_helper.sms.send_other_sms(request_body.mobile,"welcome","");
        var update_data = { totalUsers : "totalUsers+1" };
        await db.query(
            "update counter set totalUsers=totalUsers+1"
        );
        return insertId;
    }else{
        return 0;
    }
}