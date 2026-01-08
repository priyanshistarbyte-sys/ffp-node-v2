const db = require('@/config/database');
const queryHelper = require('@/helper/query-helper');

exports.checkUserPlan = (user_id) => {
    return db.query(
        queryHelper.select(
            'ispaid,expdate,status,mobile,b_email,business_category_id,free_post_count,planStatus',
            'admin',
            {'id':user_id}
        )
    );
}

exports.getUserPlanDetails = (user_id) => {
    return db.query(
        queryHelper.join(
            'p.packageid,s.plan_name',
            'payments as p',
            [['subscription_plans as s','p.packageid=s.plan_id','left']],
            {'p.user_id':user_id},
            'p.id DESC',
            1
        )
    );
}

exports.planExpired = (user_id) => {
    console.log('sandip------user_id',user_id);
    db.query(
        queryHelper.update(
            'admin',
            {"ispaid":0},
            {'id':user_id}
        )
    );
}


exports.checkUserTokenExistWithDevice = async (where) => {
    var exist = await db.query(
        queryHelper.select(
            'n_id',
            'notification',
            where
        )
    );
    if(exist.length > 1){
        await db.query(
            "delete from notification where device_id='"+where.device_id+"'"
        );
        return [];
    }else{
        return exist;
    }
}

exports.checkTokenWithUserOrDevice = async (user_id,device_id) => {
    var exist = await db.query(
        'select n_id from notification where user_id="'+user_id+'" OR device_id="'+device_id+'"'
    );
    if(exist.length > 1){
        await db.query(
            'delete from notification where user_id="'+user_id+'" OR device_id="'+device_id+'"'
        );
        return [];
    }else{
        return exist;
    }
}

exports.updateUserToken = (data,where) => {
    return db.query(
        queryHelper.update('notification',data,where)
    );
}

exports.insertUserToken = (data) => {
    return db.query(
        queryHelper.insert('notification',data)
    );
}
