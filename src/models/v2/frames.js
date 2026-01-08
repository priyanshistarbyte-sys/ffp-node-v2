const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');

exports.getUserFrames = (user_id) => {
    return db.query(
        queryHelper.select(
            'frame_name,image,free_paid,status,data,logosection',
            'customframe',
            {'status':1,'user_id':user_id}
        )
    );
}

exports.getDefaultFrames = () => {
    return db.query(
        queryHelper.select(
            'id,frame_name,free_paid,status,image,data,logosection',
            'frames',
            {'status':1}
        )
    );
}

exports.getSubFrames = (frame_id) => {
    return db.query(
        queryHelper.select(
            'image,frame_id',
            'sub_frames',
            {'status':1,"frame_id":frame_id}
        )
    );
}
