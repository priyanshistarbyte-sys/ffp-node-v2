const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');

const { API_BASE_URL } = process.env;

exports.getFAQs = async () => {
    var where ={ status:1 };
    return await db.query(
        queryHelper.select('id,question,answer,created_at,img,link','faq',where)
    );
}

exports.setVideoAnylitics = async () => {

    await db.query(
        "UPDATE counter SET totalVideos = totalVideos + 1"
    );

    const today = config.ONLY_DATE();

    if (!today) {
        throw new Error("ONLY_DATE() returned undefined");
    }

    const [rows] = await db.query(
        "SELECT id FROM videoanalytics WHERE date = ? LIMIT 1",
        [today]
    );

    if (rows.length > 0) {

        await db.query(
            "UPDATE videoanalytics SET count = count + 1 WHERE id = ?",
            [rows[0].id]
        );

    } else {

        await db.query(
            "INSERT INTO videoanalytics (date, count) VALUES (?, ?)",
            [today, 1]
        );
    }
};

exports.getNotifications  = async () => {
    
    var where ={ status:1 };
    var [notifications] = await db.query(
        queryHelper.select('id, title, message, image, url, status, page, page_data,  created_at','notification_send',where,"id desc")
    );
    var foNotifications = [];
    if(notifications.length > 0){

        for (const foSingleElement of notifications) {
            foSingleElement.created_at = foSingleElement.created_at!="0000-00-00 00:00:00"?commonHelper.customFormatDate(foSingleElement.created_at,'d, M Y g:i a'):'';

            if(foSingleElement.image && foSingleElement.image!=""){
                foSingleElement.image = `${API_BASE_URL}/storage/${foSingleElement.image}`;
            }else if(foSingleElement.url){
                var split = foSingleElement.url.split('-_-');
                if(split[0]=='cat'){
                    var cat_id = split[1];

                    var [singleBanner] = await db.query(
                        queryHelper.select('noti_banner','sub_categories',{id:cat_id},"",1)
                    );
                        
                    if(singleBanner.length > 0 && singleBanner[0].noti_banner!=null && singleBanner[0].noti_banner!="" ){
                        foSingleElement.image =  `${API_BASE_URL}/storage/${singleBanner[0].noti_banner}`;
                    }else{
                        foSingleElement.image = "";    
                    }
                }else{
                    foSingleElement.image = "";
                }
            }
    
            foNotifications.push(foSingleElement);
        }
    }
    return foNotifications;
}