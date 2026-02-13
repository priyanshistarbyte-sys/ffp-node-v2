const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');


exports.checkOldPassword = (user_id,old_pass) => {
    return db.query(
        queryHelper.select(
            'id',
            'admin',
            {'id':user_id,password:old_pass}
        )
    );
}


exports.changePassword = async (user_id,new_pass) => {
    var where ={ id:user_id,role:'User' };
    var update_data = { updated_date : config.CURRENT_DATE(),password:new_pass };

    await db.query(
        queryHelper.update('admin',update_data,where)
    );
    return true;
}

exports.deleteAccount = async (number) => {
    await db.query(
        queryHelper.update('admin', { status: 0 }, { mobile:number,role:'User' })
    );
    return true;
}

exports.checkExistingComplain = async (user_id) => {
    const result = await db.query(
        queryHelper.select(
            'id',
            'complain',
            {'user_id':user_id,"status !=":3}
        )
    );
    // Handle MySQL2 result format [rows, fields]
    const complaints = Array.isArray(result[0]) ? result[0] : result;
    return complaints;
}


exports.insertComplain = async (request_body) => {
    var insert = await db.query(
        queryHelper.insert(
            'complain',
            {
                "complain_id":"",
                'user_id':request_body.user_id,
                'subject':request_body.subject,
                'message':request_body.message,
                "status":0,
                "created_at":config.CURRENT_DATE(),
                "updated_at":config.CURRENT_DATE(),
            }
        )
    );
    // Handle MySQL2 result format
    var lastInsert = insert.insertId || insert[0].insertId;
    var compaignId = 'FFP-'+lastInsert.toString().padStart(7, "0");
    // console.log(compaignId);
    
    await db.query(
        queryHelper.update('complain',{ complain_id :compaignId },{ id:lastInsert })
    );

    return compaignId;
}


exports.getUserComplains  = async (user_id) => {
    var where ={ user_id:user_id };
    var foComapainLists = await db.query(
        queryHelper.select('id,complain_id,user_id,subject,message,reply,remark,status,created_at,updated_at','complain',where,"id")
    );
    
    // Handle MySQL2 result format
    const complaints = Array.isArray(foComapainLists[0]) ? foComapainLists[0] : foComapainLists;
    
    var foComapain = [];
    if(complaints.length >  0){
        complaints.forEach(foSingleElement => {
            // console.log("foSingleElement.status",foSingleElement.status);

            status = "Pending";
            if(foSingleElement.status==1){ status = "On Progress"; }
            if(foSingleElement.status==2){ status = "Hold"; }
            if(foSingleElement.status==3){ status = "Solved"; }
            foSingleElement.status = status;
            
            foComapain.push(foSingleElement);
        });
    }

    return foComapain;
}

exports.getBusinessDetails  = async (user_id) => {
    var where ={ id:user_id };
    const result = await db.query(
        queryHelper.select('business_name,mobile','admin',where,"",1)
    );
    // Handle MySQL2 result format
    const users = Array.isArray(result[0]) ? result[0] : result;
    return users;
}

exports.insertUserFeedback = async (request_body) => {
    return db.query(
        queryHelper.insert(
            'feedback',
            {
                'user_id':request_body.user_id,
                'subject':request_body.subject,
                'message':request_body.message,
                "created_at":config.CURRENT_DATE(),
            }
        )
    );
}

exports.getUserTempPost  = async (user_id,temp_id) => {
    var where ={ user_id:user_id,tamp_id:temp_id };
    const result = await db.query(
        queryHelper.select('post,id','makepost',where,"",1)
    );
    // Handle MySQL2 result format
    return Array.isArray(result[0]) ? result[0] : result;
}

exports.addUserPost  = async (image,user_id,temp_id,id) => {
    await db.query(
        "update counter set totalPosts=totalPosts+1"
    );
    
    const userFilter ={ user_id };
    const userCount = await db.query(
         queryHelper.select('id','daily_post_count',userFilter,"",1)
     );

     if(userCount?.length > 0){

        db.query(
            `update daily_post_count set tamp_count=tamp_count+1 where user_id=${user_id}`
        );

        db.query(
            `update admin set free_post_count=free_post_count+1 where id=${user_id}`
        );  

     } else {
        db.query(
            queryHelper.insert(
                'daily_post_count',
                {
                    'user_id':user_id,
                    'tamp_count':1,
                    "created_at":config.CURRENT_DATE(),
                    "updated_at":config.CURRENT_DATE(),
                }
            )
        );
     }



    if(id==0){
        return db.query(
            queryHelper.insert(
                'makepost',
                {
                    'user_id':user_id,
                    'tamp_id':temp_id,
                    'post':image,
                    "created_at":config.CURRENT_DATE(),
                    "updated_at":config.CURRENT_DATE(),
                }
            )
        );
    }else{
        var where ={ id:id };
        var update_data = { updated_at : config.CURRENT_DATE(),post:image };
        return db.query(
            queryHelper.update('makepost',update_data,where)
        );
    }
}


exports.getActiveCoupon  = async (coupon) => {
   var where ={ 'code':coupon,'total_qty > total_count_user_apply' : '','start_date <= ':config.CURRENT_DATE(),'end_date >= ':config.CURRENT_DATE(),'status':1 };
   const result = await db.query(
        queryHelper.select('id,total_days,title','coupon_code',where,"",1)
   );
   // Handle MySQL2 result format
   return Array.isArray(result[0]) ? result[0] : result;
}

exports.checkUserPaid  = async (user_id) => {
   var where ={ 'ispaid':0,'expdate' : null,'planStatus':null,'id':user_id,'role':'User' };
   const result = await db.query(
        queryHelper.select('id','admin',where,"",1)
   );
   // Handle MySQL2 result format
   return Array.isArray(result[0]) ? result[0] : result;
}


exports.insertData = async (tbl_name,foPaymentData) => {
    const result = await db.query(
        queryHelper.insert(tbl_name,foPaymentData)
    );
    // Handle MySQL2 result format
    return Array.isArray(result[0]) ? result[0] : result;
}

exports.updatePaymentData = async (foData,fiUserId) => {
    return db.query(
        queryHelper.update('admin',foData,{ id:fiUserId })
    );
}

exports.updateCouponUseCount = async (id) => {
    return db.query(
        "update coupon_code set total_count_user_apply=total_count_user_apply+1 where id='"+id+"'"
    );
}


exports.getCouponCode = async () => {
    const result = await db.query(
        queryHelper.select('id,title,name,code,total_qty,start_date,end_date,total_days,total_count_user_apply,note,status','coupon_code',{ status: 1 },'id')
    );
    return Array.isArray(result[0]) ? result[0] : result;
}