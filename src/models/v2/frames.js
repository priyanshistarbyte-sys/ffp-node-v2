const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');

exports.getUserFrames = async (user_id) => {
    var [result] = await db.query(
        queryHelper.select(
            'frame_name,image,free_paid,status,user_customize',
            'customframe',
            {'status':1,'user_id':user_id}
        )
    );
    return result;
}

exports.getDefaultFrames = async () => {
    var [result] = await db.query(
        queryHelper.select(
            'id,frame_name,free_paid,status,image,data,logosection',
            'frames',
            {'status':1}
        )
    );
    return result;
}

exports.getSubFrames = async (frame_id) => {
    var [result] = await db.query(
        queryHelper.select(
            'image,frame_id',
            'sub_frames',
            {'status':1,"frame_id":frame_id}
        )
    );
    return result;
}

exports.addCustomFrame = (data) => {
    return db.query(
        queryHelper.insert('customframe', data)
    );
}
