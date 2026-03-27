const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');
const { API_BASE_URL } = process.env;

// exports.getAllCategories = async () => {
//     const [categories] = await db.query(
//         queryHelper.select('*', 'categories', {}, 'sort ASC')
//     );

//     const foMainCategories = [];    
//     if (categories.length > 0) {
//         categories.forEach(cat => {
//             if (cat.icon) {
//                 cat.icon = `${API_BASE_URL}/storage/${cat.icon}`;
//             }
//             foMainCategories.push(cat);
//         });
//     }

//     return foMainCategories;
// }

exports.getAllCategories = async () => {
    const [categories] = await db.query(
        queryHelper.join(
            'c.id as category_id, c.title as cat_title, c.sort, c.icon, c.thumb, c.status, c.is_show_on_home, c.is_new, sc.id as sub_category_id, sc.image, sc.mtitle, sc.mslug, sc.lable, sc.lablebg, sc.plan_auto',
            'categories as c',
            [['sub_categories as sc', 'c.id = sc.category_id AND sc.status = 1', 'left']],
            {'c.status': 1},
            'c.sort ASC'
        )
    );

    console.log('test');
    console.log(API_BASE_URL);
    
    const foMainCategories = [];    
    if (categories.length > 0) {
        categories.forEach(cat => {
            const formattedCat = {
                category_id: cat.category_id,
                cat_title: cat.cat_title,
                sort: cat.sort,
                sub: cat.sub_category_id ? 1 : 0,
                icon: cat.icon ? `${API_BASE_URL}/storage/${cat.icon}` : "",
                sub_category_id: cat.sub_category_id ?? "",
                image: cat.image ? `${API_BASE_URL}/storage/${cat.image}` : "",
                mtitle: cat.mtitle ?? "",
                mslug: cat.mslug ?? "",
                lable: cat.lable ?? "",
                lablebg: cat.lablebg ?? "",
                plan_auto: cat.plan_auto ?? "",
                thumb: cat.thumb ? `${API_BASE_URL}/storage/${cat.thumb}` : "",
                status: cat.status,
                is_show_on_home: cat.is_show_on_home,
                is_new: cat.is_new
            };
            foMainCategories.push(formattedCat);
        });
    }

    return foMainCategories;
}

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

    var [categories] = await db.query(
        queryHelper.select(
            'id, category_id, is_child, parent_category, image, event_date, mtitle, mslug, status, lable, lablebg, noti_banner, noti_quote, plan_auto, is_trending, created_at, updated_at',
            'sub_categories',
            where,
            order_by
        )
    );
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
    var [templates] = await db.query(
        queryHelper.join(
            't.id,t.planImgName,t.free_paid,t.event_date,t.sub_category_id,t.path,t.font_type,t.font_size,t.font_color,t.lable,t.lablebg,t.created_at,t.updated_at,s.id,\
             s.mslug as cat_slug,IFNULL(t.mask,"") AS mask,t.has_mask,s.mtitle as cat_name,s.plan_auto,s.is_trending,t.language',
            'tamplet as t',
            [['sub_categories as s','t.sub_category_id=s.id','left']],
            where,
            order_by,
            limit!=""?config.POSTLIMIT:''
        )
    );

    var foTemplates = [];
    if(templates.length > 0){
        templates.forEach(foSingleElement => {
            foSingleElement.event_date = foSingleElement.event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.event_date,'d, F Y'):'';
            foSingleElement.lable = foSingleElement.lable ?? "";
            foSingleElement.lablebg = foSingleElement.lablebg ?? "";
    
            var plan = 'no';
            var auto = 'no';
            if(foSingleElement.planImgName){
                plan = "yes";
                // foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.id+".jpg";
                foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.path;
                foSingleElement.pathB = API_BASE_URL + '/storage/' + foSingleElement.path;
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
            
            // Handle multiple masks stored as JSON array
            if (foSingleElement.mask && foSingleElement.mask !== "") {
                try {
                    const masks = JSON.parse(foSingleElement.mask);
                    foSingleElement.mask = masks.map(m => `${API_BASE_URL}/storage/${m}`);
                } catch (e) {
                    foSingleElement.mask = `${API_BASE_URL}/storage/${foSingleElement.mask}`;
                }
            } else {
                foSingleElement.mask = null;
            }
            
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
    var [videos] = await db.query(
        queryHelper.join(
            'v.id,v.sub_category_id ,v.type,v.free_paid,v.path,v.thumb,v.lable,v.lablebg,v.status,v.created_at,v.updated_at,s.event_date',
            'videogif as v',
            [['sub_categories as s','v.sub_category_id=s.id','left']],
            {'v.sub_category_id':sub_category_id,'v.status':1}
        )
    );

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

//     var [homePagePosts] = await db.query(
//         queryHelper.join(
//             'h.sub_category_id,h.category_id,h.mtitle as cat_name,h.mslug as cat_slug,h.sequence,h.home_status,h.is_new,' +
//             'h.template_id,h.free_paid,h.event,h.sub_event_date,h.path,h.font_type,h.font_size,h.font_color,' +
//             'h.template_lable,h.template_lablebg,h.planImgName,h.created_at,h.updated_at,h.plan_auto,' +
//             'c.icon as cat_icon,sc.image as cat_image',
//             'home_page_category_wise_posts as h',
//             [
//                 ['categories as c', 'h.category_id = c.id', 'left'],
//                 ['sub_categories as sc', 'h.sub_category_id = sc.id', 'left']
//             ],
//             { "h.home_status": 1 }
//         )
//     );

//     var foFinalArray = [];
//     if(homePagePosts.length > 0){
//         var foCategoryWisePosts = {};
//         homePagePosts.forEach(foSingleElement => {
//             foSingleElement.event_date = foSingleElement.sub_event_date && foSingleElement.sub_event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.sub_event_date,'d, F Y'):'';

//             var plan = 'no';
//             var auto = 'yes';
//             if(foSingleElement.planImgName && foSingleElement.planImgName!=""){
//                 plan = "yes";
//                 foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.template_id+".jpg";
//                 foSingleElement.pathB = API_BASE_URL + '/storage/' +foSingleElement.cat_slug+'/'+ foSingleElement.template_id+".jpg";
//             }else if(foSingleElement.path && foSingleElement.path!=""){
//                 if(foSingleElement.plan_auto==1 || foSingleElement.plan_auto=="1"){
//                     plan = 'yes';
//                     auto = 'no';
//                 }
//                 foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.path;
//                 foSingleElement.pathB = API_BASE_URL + '/storage/' + foSingleElement.path;
//             }
//             foSingleElement.automaticTempB = foSingleElement.path ? API_BASE_URL + '/storage/' + foSingleElement.path : '';
//             foSingleElement.plan = plan;
//             foSingleElement.auto = auto;

//             var fiCategoryId = foSingleElement.category_id;
//             if(foCategoryWisePosts[fiCategoryId]===undefined){
//                 foCategoryWisePosts[fiCategoryId] = {
//                     category_id: fiCategoryId,
//                     name: foSingleElement.cat_name,
//                     sequence: foSingleElement.sequence,
//                     icon: foSingleElement.cat_icon ? API_BASE_URL + '/storage/' + foSingleElement.cat_icon : '',
//                     image: foSingleElement.cat_image ? API_BASE_URL + '/storage/' + foSingleElement.cat_image : '',
//                     data : []
//                 };
//             }

//             delete foSingleElement.created_at;
//             delete foSingleElement.path;
//             delete foSingleElement.updated_at;
//             delete foSingleElement.plan_auto;
//             delete foSingleElement.planImgName;
//             foCategoryWisePosts[fiCategoryId].data.push(foSingleElement);
//         });

//         Object.values(foCategoryWisePosts).forEach(foSingleElement =>{
//             if(limit!=""){
//                 foSingleElement.data = foSingleElement.data.sort(() => Math.random() - 0.5).slice(0, config.POSTLIMIT);
//             }
//             foFinalArray.push(foSingleElement);
//         });

//         var sortyKey = 'sequence';
//         foFinalArray.sort(function(a, b) {
//             var x = a[sortyKey]; var y = b[sortyKey];
//             return ((x < y) ? -1 : ((x > y) ? 1 : 0));
//         });
//     }

//     return foFinalArray;
// }
exports.getHomePagePostsListWithCategoryGroup = async (limit) => {

    var selectFields = 'h.sub_category_id,h.category_id,h.mtitle as cat_name,h.mslug as cat_slug,h.sequence,h.is_new,' +
        'h.template_id,h.free_paid,h.event,h.sub_event_date,h.path,h.font_type,h.font_size,h.font_color,' +
        'h.template_lable,h.template_lablebg,h.planImgName,h.created_at,h.updated_at,h.plan_auto,' +
        'h.icon as cat_icon,h.category_thumb as cat_thumb,h.image as cat_image,h.language';
    var [homePagePosts] = await db.query(
        queryHelper.join(
            selectFields,
            'home_page_category_wise_posts as h',
            [],
            { 'h.status': 1 }
        )
    );

    var foFinalArray = [];

    if (homePagePosts.length > 0) {

        var foCategoryWisePosts = {};

        homePagePosts.forEach(foSingleElement => {

            // date format
            foSingleElement.event_date =
                foSingleElement.sub_event_date && foSingleElement.sub_event_date != "0000-00-00"
                    ? commonHelper.customFormatDate(foSingleElement.sub_event_date, 'd, F Y')
                    : '';

            var plan = 'no';
            var auto = 'yes';

            if (foSingleElement.planImgName && foSingleElement.planImgName != "") {
                plan = "yes";
                foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.template_id + ".jpg";
                foSingleElement.pathB = API_BASE_URL + '/storage/' + foSingleElement.cat_slug + '/' + foSingleElement.template_id + ".jpg";
            } else if (foSingleElement.path && foSingleElement.path != "") {

                if (foSingleElement.plan_auto == 1 || foSingleElement.plan_auto == "1") {
                    plan = 'yes';
                    auto = 'no';
                }

                foSingleElement.thumb = API_BASE_URL + '/storage/' + foSingleElement.path;
                foSingleElement.pathB = API_BASE_URL + '/storage/' + foSingleElement.path;
            }

            foSingleElement.automaticTempB = foSingleElement.path
                ? API_BASE_URL + '/storage/' + foSingleElement.path
                : '';

            foSingleElement.plan = plan;
            foSingleElement.auto = auto;

            var fiCategoryId = foSingleElement.category_id;

            if (foCategoryWisePosts[fiCategoryId] === undefined) {
                foCategoryWisePosts[fiCategoryId] = {
                    category_id: fiCategoryId,
                    name: foSingleElement.cat_name,
                    sequence: foSingleElement.sequence,
                    icon: foSingleElement.cat_icon ? API_BASE_URL + '/storage/' + foSingleElement.cat_icon : '',
                    thumb: foSingleElement.cat_thumb ? API_BASE_URL + '/storage/' + foSingleElement.cat_thumb : '',
                    data: []
                };
            }

            // cleanup
            delete foSingleElement.created_at;
            delete foSingleElement.path;
            delete foSingleElement.updated_at;
            delete foSingleElement.plan_auto;
            delete foSingleElement.planImgName;

            foCategoryWisePosts[fiCategoryId].data.push(foSingleElement);
        });

        Object.values(foCategoryWisePosts).forEach(foSingleElement => {

            if (limit != "") {
                foSingleElement.data = foSingleElement.data
                    .sort(() => Math.random() - 0.5)
                    .slice(0, config.POSTLIMIT);
            }

            foFinalArray.push(foSingleElement);
        });

        // sort by sequence
        foFinalArray.sort((a, b) => a.sequence - b.sequence);
    }

    return foFinalArray;
}

exports.searchCategoriesAndSubCategories = async (searchTerm) => {
    const searchPattern = `%${searchTerm}%`;
    
    // Search in categories
    const categoriesQuery = `
        SELECT id, title as name, 'category' as type, icon, thumb, sort, created_at, updated_at 
        FROM categories 
        WHERE title LIKE ? 
        ORDER BY sort ASC
    `;
    
    // Search in sub_categories
    const subCategoriesQuery = `
        SELECT sc.id, sc.mtitle as name, 'sub_category' as type, sc.image, sc.category_id, 
               c.title as category_name, sc.event_date, sc.mslug, sc.created_at, sc.updated_at
        FROM sub_categories sc
        LEFT JOIN categories c ON sc.category_id = c.id
        WHERE sc.mtitle LIKE ? AND sc.status = 1
        ORDER BY sc.mtitle ASC
    `;
    
    // Search in templates
    const templatesQuery = `
        SELECT t.id, t.path, t.free_paid, t.event_date, t.sub_category_id, t.font_type, t.font_size, 
               t.font_color, t.lable, t.lablebg, t.language, t.planImgName, t.has_mask, t.mask,
               sc.mtitle as sub_category_name, sc.mslug as cat_slug, sc.plan_auto, 'template' as type
        FROM tamplet t
        LEFT JOIN sub_categories sc ON t.sub_category_id = sc.id
        WHERE sc.mtitle LIKE ? AND sc.status = 1
        ORDER BY t.id DESC
    `;
    
    // Search in videos
    const videosQuery = `
        SELECT v.id, v.sub_category_id, v.type, v.free_paid, v.path, v.thumb, v.lable, v.lablebg, 
               sc.mtitle as sub_category_name, sc.event_date, 'video' as type
        FROM videogif v
        LEFT JOIN sub_categories sc ON v.sub_category_id = sc.id
        WHERE sc.mtitle LIKE ? AND v.status = 1
        ORDER BY v.id DESC
    `;
    
    // Search in posts
    const postsQuery = `
        SELECT p.id, p.user_id, p.tamp_id, p.post, p.created_at, 
               t.sub_category_id, sc.mtitle as sub_category_name, 'post' as type
        FROM makepost p
        LEFT JOIN tamplet t ON p.tamp_id = t.id
        LEFT JOIN sub_categories sc ON t.sub_category_id = sc.id
        WHERE sc.mtitle LIKE ? AND sc.status = 1
        ORDER BY p.id DESC
    `;
    
    const [[categoriesResult], [subCategoriesResult], [templatesResult], [videosResult], [postsResult]] = await Promise.all([
        db.query(categoriesQuery, [searchPattern]),
        db.query(subCategoriesQuery, [searchPattern]),
        db.query(templatesQuery, [searchPattern]),
        db.query(videosQuery, [searchPattern]),
        db.query(postsQuery, [searchPattern])
    ]);
    
    const categories = categoriesResult;
    const subCategories = subCategoriesResult;
    const templates = templatesResult;
    const videos = videosResult;
    const posts = postsResult;
    
    // Format categories
    const formattedCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon ? `${API_BASE_URL}/storage/${cat.icon}` : '',
        thumb: cat.thumb ? `${API_BASE_URL}/storage/${cat.thumb}` : ''
    }));
    
    // Format sub-categories
    const formattedSubCategories = subCategories.map(subCat => ({
        id: subCat.id,
        name: subCat.name,
        type: subCat.type,
        category_id: subCat.category_id,
        category_name: subCat.category_name,
        image: subCat.image ? `${API_BASE_URL}/storage/${subCat.image}` : null,
        event_date: subCat.event_date !== '0000-00-00' ? commonHelper.customFormatDate(subCat.event_date, 'd, F Y') : '',
        slug: subCat.mslug
    }));
    
    // Format templates
    const formattedTemplates = templates.map(temp => {
        const plan = temp.planImgName ? 'yes' : (temp.plan_auto == 1 ? 'yes' : 'no');
        const auto = temp.planImgName ? 'yes' : (temp.plan_auto == 1 ? 'no' : 'yes');
        
        // Handle multiple masks
        let maskUrls = null;
        if (temp.mask && temp.mask !== "") {
            try {
                const masks = JSON.parse(temp.mask);
                maskUrls = masks.map(m => `${API_BASE_URL}/storage/${m}`);
            } catch (e) {
                maskUrls = `${API_BASE_URL}/storage/${temp.mask}`;
            }
        }
        
        return {
            id: temp.id,
            type: temp.type,
            sub_category_id: temp.sub_category_id,
            sub_category_name: temp.sub_category_name,
            thumb: `${API_BASE_URL}/storage/${temp.path}`,
            pathB: `${API_BASE_URL}/storage/${temp.path}`,
            mask: maskUrls,
            event_date: temp.event_date !== '0000-00-00' ? commonHelper.customFormatDate(temp.event_date, 'd, F Y') : '',
            plan: plan,
            auto: auto,
            free_paid: temp.free_paid,
            language: temp.language
        };
    });
    
    // Format videos
    const formattedVideos = videos.map(video => ({
        id: video.id,
        type: video.type,
        sub_category_id: video.sub_category_id,
        sub_category_name: video.sub_category_name,
        path: `${API_BASE_URL}/storage/${video.path}`,
        thumb: video.thumb ? `${API_BASE_URL}/storage/${video.thumb}` : '',
        lable: video.lable,
        lablebg: video.lablebg,
        free_paid: video.free_paid,
        event_date: video.event_date !== '0000-00-00' ? commonHelper.customFormatDate(video.event_date, 'd, F Y') : ''
    }));
    
    // Format posts
    const formattedPosts = posts.map(post => ({
        id: post.id,
        type: post.type,
        user_id: post.user_id,
        tamp_id: post.tamp_id,
        sub_category_id: post.sub_category_id,
        sub_category_name: post.sub_category_name,
        post: post.post ? `${API_BASE_URL}/storage/${post.post}` : '',
        created_at: commonHelper.formatDate(post.created_at)
    }));
    
    return {
        categories: formattedCategories,
        sub_categories: formattedSubCategories,
        templates: formattedTemplates,
        videos: formattedVideos,
        posts: formattedPosts
    };
}