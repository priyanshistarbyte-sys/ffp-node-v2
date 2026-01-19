const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');
const { API_BASE_URL } = process.env;

exports.getSubCategories = async (category_id) => {
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 10);

    var endDate = new Date();
    endDate.setDate(endDate.getDate() + config.TOTALDAYS);
    var where =  {};
    var order_by = "";
    if(category_id==1 || category_id=="1"){
        where = { 'event_date>':commonHelper.formatDate(startDate),"event_date<":commonHelper.formatDate(endDate) }
        order_by = "event_date desc";
    }
    where.status = 1;
    where.category_id = category_id;

    var foCategoryLists = await db.query(
        queryHelper.select(
            'id, category_id, is_child, parent_category, image, event_date, mtitle, mslug, status, lable, lablebg, noti_banner, noti_quote, plan_auto, created_at, updated_at',
            'sub_categories',
            where,
            order_by
        )
    );
    
    // Handle MySQL2 result format
    const categories = Array.isArray(foCategoryLists[0]) ? foCategoryLists[0] : foCategoryLists;
    var foCategory = [];
    if(categories.length > 0){
        categories.forEach(foSingleElement => {
            foSingleElement.event_date = foSingleElement.event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.event_date,'d, F Y'):'';
            // console.log(API_BASE_URL);
            
            if(foSingleElement.image!=""){
                foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.image;
                foSingleElement.image = API_BASE_URL + '/storage/' + foSingleElement.image;
            }else{
                foSingleElement.thumb = API_BASE_URL + '/storage/';
                foSingleElement.image = API_BASE_URL + '/storage/';
            }
            foSingleElement.sub = "0";
            foSingleElement.cat_title = foSingleElement.mtitle;
            delete foSingleElement.mtitle;
            foCategory.push(foSingleElement);
        });
    }

    return foCategory;
}

exports.getLast10ByCategoryIdTemplate = async (sub_category_id, limit) => {
    var where =  { "t.sub_category_id":sub_category_id };
    // var order_by = "rand()";
    var order_by = "t.id desc";
    var foTemplatesLists = await db.query(
        queryHelper.join(
            't.id,t.planImgName,t.free_paid,t.event_date,t.sub_category_id,t.path,t.font_type,t.font_size,t.font_color,t.lable,t.lablebg,t.created_at,t.updated_at,s.id,\
             s.mslug as cat_slug,IFNULL(t.mask,"") AS mask,t.has_mask,s.mtitle as cat_name,s.plan_auto,t.language',
            'tamplet as t',
            [['sub_categories as s','t.sub_category_id=s.id','left']],
            where,
            order_by,
            limit!=""?config.POSTLIMIT:''
        )
    );

    // Handle MySQL2 result format
    const templates = Array.isArray(foTemplatesLists[0]) ? foTemplatesLists[0] : foTemplatesLists;
    var foTemplates = [];
    if(templates.length > 0){
        templates.forEach(foSingleElement => {
            foSingleElement.event_date = foSingleElement.event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.event_date,'d, F Y'):'';
    
            var plan = 'no';
            var auto = 'yes';
            if(foSingleElement.planImgName!=""){
                plan = "yes";
                foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.id+".jpg";
                foSingleElement.pathB = API_BASE_URL + '/storage/' +foSingleElement.cat_slug+'/'+ foSingleElement.id+".jpg";
            }else{
                if(foSingleElement.plan_auto==1 || foSingleElement.plan_auto=="1"){
                    plan = 'yes';
                    auto = 'no';
                    foSingleElement.pathB = API_BASE_URL + '/storage/' + foSingleElement.path;
                }else{
                    plan = 'no';
                    foSingleElement.pathB = API_BASE_URL + '/storage/' + foSingleElement.path;
                }
                foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.path;
            }
            foSingleElement.automaticTempB = API_BASE_URL + '/storage/' + foSingleElement.path;
            foSingleElement.mask = API_BASE_URL + `/storage/${foSingleElement.mask}`;
            foSingleElement.plan = plan;
            foSingleElement.auto = auto;
    
            delete foSingleElement.created_at;
            delete foSingleElement.mslug;
            delete foSingleElement.path;
            delete foSingleElement.plan_auto;
            delete foSingleElement.planImgName;
            delete foSingleElement.updated_at;

            foTemplates.push(foSingleElement);
        });
    }

    return foTemplates;
}

exports.getAllVideoByCategoryID = async (sub_category_id) => {
    var foVideoLists = await db.query(
        queryHelper.join(
            'v.id,v.sub_category_id ,v.type,v.free_paid,v.path,v.thumb,v.lable,v.lablebg,v.status,v.created_at,v.updated_at,s.event_date',
            'videogif as v',
            [['sub_categories as s','v.sub_category_id=s.id','left']],
            {'v.sub_category_id':sub_category_id,'v.status':1}
        )
    );

    // Handle MySQL2 result format
    const videos = Array.isArray(foVideoLists[0]) ? foVideoLists[0] : foVideoLists;
    var foVideos = [];
    if(videos.length > 0){
        videos.forEach(foSingleElement => {
            foSingleElement.path = foSingleElement.path!=""?API_BASE_URL + '/storage/'+foSingleElement.path:'';
            foSingleElement.event_date = commonHelper.formatDate(foSingleElement.event_date);
            foSingleElement.event_date = foSingleElement.event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.event_date,'d, F Y'):'';
            if(foSingleElement.thumb!=""){
                foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.thumb;
            }else{
                foSingleElement.thumb = API_BASE_URL + '/storage/';
            }
            foVideos.push(foSingleElement);
        });
    }

    return foVideos;
}

// exports.getHomePagePostsListWithCategoryGroup = async (limit) => {

//     /* Order by sequance takes time on query so we do it manually order by */
//     var foHomePagePostsLists = await db.query(
//         queryHelper.select(
//             'home_category_id,home_sub_category_id,home_title,sequence,home_status,is_show_on_home,is_new,\
//             template_id,free_paid,event,sub_event_date,path,font_type,font_size,font_color,template_lable,template_lablebg,\
//             planImgName,created_at,updated_at,mslug as cat_slug,mtitle as cat_name,plan_auto',
//             'home_page_category_wise_posts',
//             {home_status:1}
//         )
//     );

//     var foHomePagePosts = [];
//     if(foHomePagePostsLists.length > 0){
//         var foCategoryWisePosts = [];
//         foHomePagePostsLists.forEach(foSingleElement => {
//             foSingleElement.event_date = foSingleElement.sub_event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.sub_event_date,'d, F Y'):'';

//             var plan = 'no';
//             var auto = 'yes';
//             if(foSingleElement.planImgName!=""){
//                 plan = "yes";
//                 foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.template_id+".jpg";
//                 foSingleElement.pathB = API_BASE_URL + '/storage/' +foSingleElement.cat_slug+'/'+ foSingleElement.template_id+".jpg";
//             }else{
//                 if(foSingleElement.plan_auto==1 || foSingleElement.plan_auto=="1"){
//                     plan = 'yes';
//                     auto = 'no';
//                     foSingleElement.pathB = API_BASE_URL + '/storage/' + foSingleElement.path;
//                 }else{
//                     plan = 'no';
//                     foSingleElement.pathB = API_BASE_URL + '/storage/' + foSingleElement.path;
//                 }
//                 foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.path;
//             }
//             foSingleElement.automaticTempB = API_BASE_URL + '/storage/' + foSingleElement.path;
//             foSingleElement.plan = plan;
//             foSingleElement.auto = auto;

//             var fiCategoryId = foSingleElement.home_category_id;
//             if(foCategoryWisePosts[fiCategoryId]===undefined){
//                 foCategoryWisePosts[fiCategoryId] = { 
//                     name : foSingleElement.home_title,
//                     mid : fiCategoryId,
//                     sequence : foSingleElement.sequence,
//                     icon : foSingleElement.is_new==1 || foSingleElement.is_new=="1"?'red':'', // If null then new not exist other wise pass any text to visible new tag in app
//                     data : []
//                 };
//             }

//             delete foSingleElement.created_at;
//             delete foSingleElement.path;
//             delete foSingleElement.updated_at;
//             delete foSingleElement.home_title;
//             delete foSingleElement.home_category_id;
//             delete foSingleElement.is_new;
//             delete foSingleElement.sequence;
//             delete foSingleElement.is_show_on_home;
//             delete foSingleElement.home_sub_category_id;
//             delete foSingleElement.home_status;
//             delete foSingleElement.plan_auto
//             foCategoryWisePosts[fiCategoryId].data.push(foSingleElement);
//         });

//         /* Limit + random posts */
//         var foFinalArray = [];
//         foCategoryWisePosts.forEach(foSingleElement =>{
//             if(foSingleElement!=null){
//                 if(limit!=""){
//                     foSingleElement.data = foSingleElement.data.sort(() => Math.random() - Math.random()).slice(0, config.POSTLIMIT);
//                 }
//                 foFinalArray.push(foSingleElement);
//             }
//         });

//          /* Order by sequance */
//          var sortyKey = 'sequence';
//          foFinalArray.sort(function(a, b) {
//             var x = a[sortyKey]; var y = b[sortyKey];
//             return ((x < y) ? -1 : ((x > y) ? 1 : 0));
//         });
//     }

//     return foFinalArray;
// }

// exports.getHomePagePostsListWithCategoryGroup = async (limit) => {

//     var foHomePagePostsLists = await db.query(
//         queryHelper.select(
//             'home_category_id,home_sub_category_id,home_title,sequence,home_status,is_show_on_home,is_new,\
//              sub_category_id,category_id,mtitle,mslug,image,sub_event_date,plan_auto,sub_lable,sub_lablebg,\
//              template_id,free_paid,event,template_event_date,path,font_type,font_size,font_color,\
//              template_lable,template_lablebg,language,planImgName,created_at,updated_at',
//             'home_page_category_wise_posts',
//             { home_status: 1, is_show_on_home: 1 }
//         )
//     );

//     var foFinalArray = [];

//     if (foHomePagePostsLists.length > 0) {

//         var foCategoryWisePosts = {}; // ✅ object, not array

//         foHomePagePostsLists.forEach(foSingleElement => {

//             /* Format event date */
//             foSingleElement.event_date =
//                 foSingleElement.sub_event_date && foSingleElement.sub_event_date !== "0000-00-00"
//                     ? commonHelper.customFormatDate(foSingleElement.sub_event_date, 'd, F Y')
//                     : '';

//             /* Plan logic */
//             let plan = 'no';
//             let auto = 'yes';

//             if (foSingleElement.planImgName) {
//                 plan = 'yes';
//                 foSingleElement.thumb =
//                     API_BASE_URL + '/storage/' + foSingleElement.template_id + '.jpg';
//                 foSingleElement.pathB =
//                     API_BASE_URL + '/storage/' + foSingleElement.mslug + '/' + foSingleElement.template_id + '.jpg';
//             } else {
//                 if (String(foSingleElement.plan_auto) === '1') {
//                     plan = 'yes';
//                     auto = 'no';
//                 }
//                 foSingleElement.thumb =
//                     API_BASE_URL + '/storage/' + foSingleElement.path;
//                 foSingleElement.pathB =
//                     API_BASE_URL + '/storage/' + foSingleElement.path;
//             }

//             foSingleElement.automaticTempB =
//                 API_BASE_URL + '/storage/' + foSingleElement.path;

//             foSingleElement.plan = plan;
//             foSingleElement.auto = auto;

//             /* Group by home category */
//             const fiCategoryId = foSingleElement.home_category_id;

//             if (!foCategoryWisePosts[fiCategoryId]) {
//                 foCategoryWisePosts[fiCategoryId] = {
//                     name: foSingleElement.home_title,
//                     mid: fiCategoryId,
//                     sequence: foSingleElement.sequence,
//                     icon: (String(foSingleElement.is_new) === '1') ? 'red' : '',
//                     data: []
//                 };
//             }

//             /* Remove unnecessary fields from item */
//             delete foSingleElement.created_at;
//             delete foSingleElement.updated_at;
//             delete foSingleElement.home_title;
//             delete foSingleElement.home_category_id;
//             delete foSingleElement.home_sub_category_id;
//             delete foSingleElement.sequence;
//             delete foSingleElement.home_status;
//             delete foSingleElement.is_show_on_home;
//             delete foSingleElement.is_new;
//             delete foSingleElement.plan_auto;

//             foCategoryWisePosts[fiCategoryId].data.push(foSingleElement);
//         });

//         /* Convert object → array */
//         Object.values(foCategoryWisePosts).forEach(foSingleElement => {

//             if (limit) {
//                 foSingleElement.data =
//                     foSingleElement.data
//                         .sort(() => Math.random() - Math.random())
//                         .slice(0, config.POSTLIMIT);
//             }

//             foFinalArray.push(foSingleElement);
//         });

//         /* Order by sequence */
//         foFinalArray.sort((a, b) => a.sequence - b.sequence);
//     }

//     return foFinalArray;
// };


exports.getHomePagePostsListWithCategoryGroup = async (limit) => {

    /* Order by sequance takes time on query so we do it manually order by */
    var foHomePagePostsLists = await db.query(
        queryHelper.join(
            'h.home_category_id,h.home_sub_category_id,h.home_title,h.sequence,h.home_status,h.is_show_on_home,h.is_new,\
            h.template_id,h.free_paid,h.event,h.sub_event_date,h.path,h.font_type,h.font_size,h.font_color,h.template_lable,h.template_lablebg,\
            h.planImgName,h.created_at,h.updated_at,s.mslug as cat_slug,s.mtitle as cat_name,s.plan_auto',
            'home_page_category_wise_posts as h',
            [['sub_categories as s','h.home_sub_category_id=s.id','left']],
            {"h.home_status":1}
        )
    );

    // Handle MySQL2 result format
    const homePagePosts = Array.isArray(foHomePagePostsLists[0]) ? foHomePagePostsLists[0] : foHomePagePostsLists;
    var foHomePagePosts = [];
    if(homePagePosts.length > 0){
        var foCategoryWisePosts = [];
        homePagePosts.forEach(foSingleElement => {
            foSingleElement.event_date = foSingleElement.sub_event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.sub_event_date,'d, F Y'):'';

            var plan = 'no';
            var auto = 'yes';
            if(foSingleElement.planImgName!=""){
                // console.log(foSingleElement);
                plan = "yes";
                foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.template_id+".jpg";
                foSingleElement.pathB = API_BASE_URL + '/storage/' +foSingleElement.cat_slug+'/'+ foSingleElement.template_id+".jpg";
            }else{
                //  console.log(foSingleElement);
                if(foSingleElement.plan_auto==1 || foSingleElement.plan_auto=="1"){
                    plan = 'yes';
                    auto = 'no';
                    foSingleElement.pathB = API_BASE_URL + '/storage/' + foSingleElement.path;
                }else{
                    plan = 'no';
                    foSingleElement.pathB = API_BASE_URL + '/storage/' + foSingleElement.path;
                }
                foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.path;
            }
            foSingleElement.automaticTempB = API_BASE_URL + '/storage/' + foSingleElement.path;
            foSingleElement.plan = plan;
            foSingleElement.auto = auto;

            var fiCategoryId = foSingleElement.home_category_id;
            if(foCategoryWisePosts[fiCategoryId]===undefined){
                foCategoryWisePosts[fiCategoryId] = { 
                    name : foSingleElement.home_title,
                    mid : fiCategoryId,
                    sequence : foSingleElement.sequence,
                    icon : foSingleElement.is_new==1 || foSingleElement.is_new=="1"?'red':'', // If null then new not exist other wise pass any text to visible new tag in app
                    data : []
                };
            }

            delete foSingleElement.created_at;
            delete foSingleElement.path;
            delete foSingleElement.updated_at;
            delete foSingleElement.home_title;
            delete foSingleElement.home_category_id;
            delete foSingleElement.is_new;
            delete foSingleElement.sequence;
            delete foSingleElement.is_show_on_home;
            delete foSingleElement.home_sub_category_id;
            delete foSingleElement.home_status;
            delete foSingleElement.plan_auto
            foCategoryWisePosts[fiCategoryId].data.push(foSingleElement);
        });

        /* Limit + random posts */
        var foFinalArray = [];
        foCategoryWisePosts.forEach(foSingleElement =>{
            if(foSingleElement!=null){
                if(limit!=""){
                    foSingleElement.data = foSingleElement.data.sort(() => Math.random() - Math.random()).slice(0, config.POSTLIMIT);
                }
                foFinalArray.push(foSingleElement);
            }
        });

         /* Order by sequance */
         var sortyKey = 'sequence';
         foFinalArray.sort(function(a, b) {
            var x = a[sortyKey]; var y = b[sortyKey];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    return foFinalArray;
}