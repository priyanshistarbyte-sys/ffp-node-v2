const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');


exports.getFAQs = async () => {
    var where ={ status:1 };
    return await db.query(
        queryHelper.select('id,question,answer,created_at,img,link','faq',where)
    );
}

exports.setVideoAnylitics = async () => {
    await db.query(
        "update counter set totalVideos=totalVideos+1"
    );

    /* Check entry exist on today */
    var todayVideo = await db.query(
        queryHelper.select('id','videoanalytics',{va_date:config.ONLY_DATE()})
    );

    if(todayVideo.length > 0){
        await db.query(
            "update videoanalytics set count=count+1 where id="+todayVideo[0].id
        );
    }else{
        await db.query(
            queryHelper.insert(
                'videoanalytics',
                {
                    'count':1,
                    "date":config.CURRENT_DATE()
                }
            )
        );
    }
}

exports.getNotifications  = async () => {
    
    var where ={ status:1 };
    var notifications = await db.query(
        queryHelper.select('id, title, message, image, url, status, created_date','notification_send',where,"id desc")
    );
    var foNotifications = [];
    if(notifications.length > 0){

        for (const foSingleElement of notifications) {
            foSingleElement.created_date = foSingleElement.created_date!="0000-00-00 00:00:00"?commonHelper.customFormatDate(foSingleElement.created_date,'d, M Y g:i a'):'';

            if(foSingleElement.image!=""){
                foSingleElement.image = "media/notification/" +foSingleElement.image;
            }else{
                var split = foSingleElement.url.split('-_-');
                if(split[0]=='cat'){
                    var cat_id = split[1];

                    var singleBanner = await db.query(
                        queryHelper.select('noti_banner','sub_categories',{mid:cat_id},"",1)
                    );
                        
                    if(singleBanner.length > 0 && singleBanner[0].noti_banner!=null && singleBanner[0].noti_banner!="" ){
                        foSingleElement.image = "media/category/banner/"+singleBanner[0].noti_banner;
                    }else{
                        foSingleElement.image = "";    
                    }
                    console.log('data');
                }else{
                    foSingleElement.image = "";
                }
            }
    
            foNotifications.push(foSingleElement);
        }
    }
    console.log('res');
    return foNotifications;
}