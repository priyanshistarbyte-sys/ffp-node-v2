const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('@/helper/query-helper');
const commonHelper = require('@/helper/common-helper');


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
    where.c_id = c_id;

    var foCategoryLists = await db.query(
        queryHelper.select(
            'id, category_id, image, event_date, mtitle, mslug, status, lable, lablebg, noti_banner, noti_quote, plan_auto, created_at, updated_at',
            'sub_categories',
            where,
            order_by
        )
    );

    var foCategory = [];
    if(foCategoryLists.length > 0){
        foCategoryLists.forEach(foSingleElement => {
            foSingleElement.event_date = foSingleElement.event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.event_date,'d, F Y'):'';
            if(foSingleElement.image!=""){
                foSingleElement.thumb = "media/category/thumb/" + foSingleElement.image;
                foSingleElement.image = "media/category/" + foSingleElement.image;
            }else{
                foSingleElement.thumb = "media/category/notcategoryimg.jpg";
                foSingleElement.image = "media/category/notcategoryimg.jpg";
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
            't.id,t.planImgName,t.free_paid,t.t_event_date,t.sub_category_id,t.path,t.font_type,t.font_size,t.font_color,t.lable,t.lablebg,t.created_at,t.updated_at,s.id,\
             s.mslug as cat_slug,IFNULL(t.mask,"") AS mask,t.has_mask,s.mtitle as cat_name,s.plan_auto,t.language',
            'tamplet as t',
            [['sub_categories as s','t.sub_category_id=s.id','left']],
            where,
            order_by,
            limit!=""?config.POSTLIMIT:''
        )
    );

    var foTemplates = [];
    if(foTemplatesLists.length > 0){
        foTemplatesLists.forEach(foSingleElement => {
            foSingleElement.t_event_date = foSingleElement.t_event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.t_event_date,'d, F Y'):'';
    
            var plan = 'no';
            var auto = 'yes';
            if(foSingleElement.planImgName!=""){
                plan = "yes";
                foSingleElement.thumb = "media/template/plan/thumb/" + foSingleElement.tid+".jpg";
                foSingleElement.pathB = "media/template/plan/" +foSingleElement.cat_slug+'/'+ foSingleElement.tid+".jpg";
            }else{
                if(foSingleElement.plan_auto==1 || foSingleElement.plan_auto=="1"){
                    plan = 'yes';
                    auto = 'no';
                    foSingleElement.pathB = "media/template/" + foSingleElement.path;
                }else{
                    plan = 'no';
                    foSingleElement.pathB = "media/template/" + foSingleElement.path;
                }
                foSingleElement.thumb = "media/template/thumb/" + foSingleElement.path;
            }
            foSingleElement.automaticTempB = "media/template/" + foSingleElement.path;
            foSingleElement.mask = `media/template/${foSingleElement.mask}`;
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
            'v.id,v.sub_category_id ,v.type,v.free_paid,v.path,v.thumb,v.lable,v.lablebg,v.status,v.created_at,v.updated_at,m.event_date',
            'videogif as v',
            [['sub_categories as s','v.sub_category_id=s.id','left']],
            {'v.sub_category_id':sub_category_id,'v.status':1}
        )
    );

    var foVideos = [];
    if(foVideoLists.length > 0){
        foVideoLists.forEach(foSingleElement => {
            foSingleElement.path = foSingleElement.path!=""?'media/videogif/'+foSingleElement.path:'';
            foSingleElement.event_date = commonHelper.formatDate(foSingleElement.event_date);
            foSingleElement.t_event_date = foSingleElement.event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.event_date,'d, F Y'):'';
            if(foSingleElement.thumb!=""){
                foSingleElement.thumb = "media/videogif/thumb/" + foSingleElement.thumb;
            }else{
                foSingleElement.thumb = "media/videogif/thumb/novideo.jpg";
            }
            foVideos.push(foSingleElement);
        });
    }

    return foVideos;
}

exports.getHomePagePostsListWithCategoryGroup = async (limit) => {

    /* Order by sequance takes time on query so we do it manually order by */
    var foHomePagePostsLists = await db.query(
        queryHelper.select(
            'id,category_id,title,sequence,status,is_show_on_home,is_new,planImgName,\
            tid,free_paid,type,p_id,t_event_date,cat_id,path,font_type,font_size,font_color,lable,lablebg,created_at,updated_at,\
            mid, mslug  as cat_slug, mtitle as cat_name,plan_auto',
            'home_page_category_wise_posts',
            {status:1}
        )
    );

    var foHomePagePosts = [];
    if(foHomePagePostsLists.length > 0){
        var foCategoryWisePosts = [];
        foHomePagePostsLists.forEach(foSingleElement => {
            foSingleElement.t_event_date = foSingleElement.t_event_date!="0000-00-00"?commonHelper.customFormatDate(foSingleElement.t_event_date,'d, F Y'):'';

            var plan = 'no';
            var auto = 'yes';
            if(foSingleElement.planImgName!=""){
                plan = "yes";
                foSingleElement.thumb = "media/template/plan/thumb/" + foSingleElement.tid+".jpg";
                foSingleElement.pathB = "media/template/plan/" +foSingleElement.cat_slug+'/'+ foSingleElement.tid+".jpg";
            }else{
                if(foSingleElement.plan_auto==1 || foSingleElement.plan_auto=="1"){
                    plan = 'yes';
                    auto = 'no';
                    foSingleElement.pathB = "media/template/" + foSingleElement.path;
                }else{
                    plan = 'no';
                    foSingleElement.pathB = "media/template/" + foSingleElement.path;
                }
                foSingleElement.thumb = "media/template/thumb/" + foSingleElement.path;
            }
            foSingleElement.automaticTempB = "media/template/" + foSingleElement.path;
            foSingleElement.plan = plan;
            foSingleElement.auto = auto;

            var fiCategoryId = foSingleElement.category_id;
            if(foCategoryWisePosts[fiCategoryId]===undefined){
                foCategoryWisePosts[fiCategoryId] = { 
                    name : foSingleElement.title,
                    mid : fiCategoryId,
                    sequence : foSingleElement.sequence,
                    icon : foSingleElement.is_new==1 || foSingleElement.is_new=="1"?'red':'', // If null then new not exist other wise pass any text to visible new tag in app
                    data : []
                };
            }

            delete foSingleElement.created_at;
            delete foSingleElement.path;
            delete foSingleElement.updated_at;
            delete foSingleElement.title;
            delete foSingleElement.id;
            delete foSingleElement.is_new;
            delete foSingleElement.sequence;
            delete foSingleElement.sequence;
            delete foSingleElement.is_show_on_home;
            delete foSingleElement.category_id;
            delete foSingleElement.status;
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