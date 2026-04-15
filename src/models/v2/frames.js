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

exports.getDefaultFrames = async (sub_category_id) => {
    const where = sub_category_id ? {'status':1,'sub_category_id':sub_category_id} : {'status':1};
    var [result] = await db.query(
        queryHelper.select(
            'id,frame_name,free_paid,status,image,data,logosection,sub_category_id',
            'frames',
            where
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

exports.deleteCustomFrame = (user_id, frame_name) => {
    return db.query(
        queryHelper.delete('customframe', { user_id, frame_name })
    );
}
