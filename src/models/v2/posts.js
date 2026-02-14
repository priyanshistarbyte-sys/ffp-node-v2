const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');

// exports.getTodayPosts = (limit="") => {
//     return db.query(
//         queryHelper.join(
//             't.id,t.planImgName,t.free_paid,t.event_date,t.sub_category_id,t.path,t.font_type,t.font_size,t.font_color,t.lable,t.lablebg,t.created_at,t.updated_at,s.id,\
//             s.mslug,s.mtitle as cat_name,s.plan_auto,s.is_trending,t.language,IFNULL(t.mask,"") AS mask,t.has_mask',
//             'tamplet as t',
//             [['sub_categories as s','t.sub_category_id=s.id','left']],
//             {'t.event_date':config.ONLY_DATE(),'s.status':1},
//             't.id desc',
//             limit
//         )
//     );
// }
exports.getTodayPosts = (limit = "") => {
    return db.query(
        queryHelper.join(
            `
            t.id,
            t.planImgName,
            t.free_paid,
            DATE_FORMAT(t.event_date, '%Y-%m-%d') AS event_date,
            t.sub_category_id,
            t.path,
            t.font_type,
            t.font_size,
            t.font_color,
            t.lable,
            t.lablebg,
            t.created_at,
            t.updated_at,
            s.id,
            s.mslug,
            s.mtitle as cat_name,
            s.plan_auto,
            s.is_trending,
            t.language,
            IFNULL(t.mask,'') AS mask,
            t.has_mask
            `,
            'tamplet as t',
            [['sub_categories as s', 't.sub_category_id = s.id', 'left']],
            {
                't.event_date': config.ONLY_DATE(),
                's.status': 1
            },
            `
            FIELD(t.language,
                'English',
                'Hindi',
                'Gujarati',
                'Marathi',
                'Telugu',
                'Malayalam',
                'Tamil',
                'Banagali',
                'Panjabi',
                'Odia',
                'Kannad',
                'URDU'
            ),
            t.id DESC
            `,
            limit
        )
    );
};

// exports.getUpcomingPosts = (limit="") => {
//     var startDate = new Date();
//     console.log('getUpcomingPosts called - Current Date:', startDate);
    
//     startDate.setDate(startDate.getDate() - 10);
//     console.log('Start Date (10 days ago):', startDate, '| Formatted:', commonHelper.formatDate(startDate));

//     var endDate = new Date();
//     endDate.setDate(endDate.getDate() + config.TOTALDAYS);
//     console.log('End Date (+', config.TOTALDAYS, 'days):', endDate, '| Formatted:', commonHelper.formatDate(endDate));
//     return db.query(
//         queryHelper.select(
//             'id,category_id,image,event_date,mtitle,mslug,status,lable,lablebg,noti_banner,noti_quote,plan_auto,created_at,updated_at',
//             'sub_categories',
//             {'status':1,'event_date>':commonHelper.formatDate(startDate),"event_date<":commonHelper.formatDate(endDate)},
//             "event_date desc",
//             limit
//         )
//     );
// }

exports.getUpcomingPosts = (limit="") => {

    // TODAY (start)
    const startDate = new Date();

    // TODAY + 30 days (end)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    console.log("Start Date:", commonHelper.formatDate(startDate));
    console.log("End Date:", commonHelper.formatDate(endDate));

    return db.query(
        queryHelper.select(
            'id,category_id,image,event_date,mtitle,mslug,status,lable,lablebg,noti_banner,noti_quote,plan_auto,created_at,updated_at',
            'sub_categories',
            {
                'status':1,
                'event_date>=': commonHelper.formatDate(startDate),
                'event_date<=': commonHelper.formatDate(endDate)
            },
            "event_date asc",
            limit
        )
    );
}

exports.getTodayVideoPost = (limit="") => {
    return db.query(
        queryHelper.join(
            'v.id,v.sub_category_id,v.type,v.free_paid,v.path,v.thumb,v.lable,v.lablebg,v.status,v.created_at,v.updated_at,s.id,s.event_date',
            'sub_categories as s',
            [['videogif as v','s.id=v.sub_category_id','right']],
            {'s.event_date':config.ONLY_DATE(),'s.status':1,'v.status':1},
            limit
        )
    );
}

