const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');

exports.getStatusCategories = async () => {
    var [result] = await db.query(
        queryHelper.select(
            'id,title,image,lable,lablebg',
            'photo_status',
            "","rand()"
        )
    );
    return result;
}


exports.getStatusPhotos = async (photo_status_id,limit) => {
    var where = "";
    if(photo_status_id!=""){
        where = { photo_status_id:photo_status_id };
    }
    var [result] = await db.query(
        queryHelper.select(
            'id,photo_status_id,photo,created_at,updated_at',
            'photos',
            where,"rand()",
            /* limit!=""?config.POSTLIMIT:'' */
        )
    );
    return result;
}
