const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');

exports.getFamilyCategories = () => {
    return db.query(
        queryHelper.select(
            'id,image,mtitle as cat_title,lable,lablebg',
            'sub_categories',
            {status:1,mslug:'family'}
        )
    );
}