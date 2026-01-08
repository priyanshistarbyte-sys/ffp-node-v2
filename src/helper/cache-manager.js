const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('./query-helper');
const commonHelper = require('./common-helper');
const fs = require("fs").promises;

exports.getDataFromCache = async (cacheKey) => {
    var fbIsCacheExist = true;
    var foCacheDetails = {};

    try {
        var fileCache = await fs.readFile("./cache/cache.json", "binary"); 
        fileCache = JSON.parse(fileCache);
        return fileCache[cacheKey];
    } catch (error) {
        fbIsCacheExist = false;
    }
    
    // fbIsCacheExist = false; // False if ignore caching


    /* Create New Cache */
    if(fbIsCacheExist===false){

        /* getNewAdsmobList */
        var foApplicationAd = await db.query(
            queryHelper.select(
                'app_id,status,adclick,mode',
                'application_add',
                ''
            )
        );

        if(foApplicationAd.length > 0){
            foApplicationAd = foApplicationAd[0];
            foApplicationAd.openadd="1";
            foApplicationAd.backadd="1";

            /* Get Add Type */
            var foAdsListAll = await db.query(
                queryHelper.select(
                    'ads_title,ads_id,ads_type',
                    'ads_api',
                    {'app_id':foApplicationAd.app_id}
                )
            );
            
            var foResult = {google:{},facebook:{},dailog:{}};
            foAdsListAll.forEach(element => {
                var type = element.ads_type=="1"?'google' : 'facebook';
                foResult[type][element.ads_title]=element.ads_id;
            });


            var foDialog = await db.query(
                queryHelper.select(
                    'd_title,d_description,d_button1,d_button2,d_link,image,d_appversion,d_forcefully,d_other_forcefully,d_isDisplay,d_other_isDisplay,o_type,o_link',
                    'dailog',
                    ''
                )
            );

            if(foDialog.length > 0){
                foDialog[0].image = foDialog[0].image!=""?'media/dailog/'+foDialog[0].image:'';
                foResult.dailog = foDialog[0];
            }

            foApplicationAd.result = {};
            foApplicationAd.result = foResult;
            foCacheDetails.getNewAdsmobList = foApplicationAd;
        }
        /* getNewAdsmobList */

        
        /* appMasterAP */
         var foAllSettingData = await db.query(
            queryHelper.select(
                'id, option_name,value',
                'setting',
                ''
            )
        );

        if(foAllSettingData.length > 0){
            var foAllSetting = {};
            foAllSettingData.forEach(element => {
                foAllSetting[element.option_name] = element.value;
            });

            var foMenus = [];
            foMenus.push({ "menu_id":"1","title":"Help & Support","status":foAllSetting['help-support'] });
            foMenus.push({ "menu_id":"2","title":"Feedback & Suggestio","status":foAllSetting['feedback-suggestion'] });
            foMenus.push({ "menu_id":"3","title":"Premium Subscription","status":foAllSetting['premium-subscription'] });
            foMenus.push({ "menu_id":"4","title":"Refer & Earn","status":foAllSetting['refer-earn'] });
            foMenus.push({ "menu_id":"5","title":"Complaint Menu","status":foAllSetting['complaint_menu'] });
            
            foCacheDetails.appMasterAP = {
                "menu":foMenus,
                "account_name" : "Khushi",
                "account_mobile" : "+91 8140 331370",
                "callnumber" : foAllSetting['support_call'],
                "whatsupnumber" : foAllSetting['whatsappNumber'],
                "userstatus" : 0,
                "userIsPaid" : 0,
                "expirydate" : "",
                "userPlanActiveName" : "",
                "user_token" : 0,
                "forcefullyLogout" : foAllSetting['forceFullyLogout'],
                "paymentTransactionKey1" : foAllSetting['paymentTKey1'],
                "paymentTransactionKey2" : foAllSetting['paymentTKey2'],
                "paymentTransactionSecretkey" : foAllSetting['secretKey'],
                "aboutUs" : foAllSetting['aboutUs'],
                "aboutUs" : foAllSetting['aboutUs'],
                "shareLink" : foAllSetting['sharingLink'],
                "sharingBanner" : foAllSetting['sharingBanner']==""?"":"media/sharingBanner/"+foAllSetting['sharingBanner'],
                "diffview" : foAllSetting['diffview'],
                "currentDate" : config.ONLY_DATE(),
                "beforeDaysMakePost":config.BEFORE_DAYS_MAKE_POST(),
                "CustomFreeUserPostLimit":config.CUSTOM_FREE_USER_POST_LIMIT,
                "CustomFreeUserVideoLimit":config.CUSTOM_FREE_USER_VIDEO_LIMIT,
                "ratedailogday":config.RATEDAILOGDAY,
                "website":config.WEBSITE,
                "youtubeUrl":config.YOUTUBEURL
            };
        }
        /* appMasterAP */

        /* Home Screen Slider */
        var foAppSliderData = await db.query(
            queryHelper.select(
                'cat_title,image,mid,sub,url,sort,festivalDate',
                'appSlider',
                {'status':1},
                "sort asc"
            )
        );

        if(foAppSliderData.length > 0){
            var foAppSlider = [];
            foAppSliderData.forEach(foSingleElement => {
                foSingleElement.festivalDate = commonHelper.formatDate(foSingleElement.festivalDate);
                foSingleElement.image = "media/slider/"+foSingleElement.image;
                foAppSlider.push(foSingleElement);
            });
            
            foCacheDetails.foAppSlider = foAppSlider;
        }
        /* Home Screen Slider */


        /* Main Category */
        var foMainCategoryLists = await db.query(
            queryHelper.select(
                '*',
                'all_main_categories',
                "",
            )
        );

        if(foMainCategoryLists.length > 0){
            var foMainCategories = [];
            foMainCategoryLists.forEach(foSingleElement => {
                if(foSingleElement.sub=="1" || foSingleElement.sub==1){
                    foSingleElement.mid = foSingleElement.cid;
                    foSingleElement.image = foSingleElement.pathh;
                    foSingleElement.thumb = foSingleElement.pathh;
                }else{
                    if(foSingleElement.image!=""){
                        foSingleElement.thumb = "media/category/thumb/"+foSingleElement.image
                        foSingleElement.image = "media/category/"+foSingleElement.image
                    }else{
                        foSingleElement.thumb = "media/category/notcategoryimg.jpg";
                        foSingleElement.image = "media/category/notcategoryimg.jpg";
                    }
                }
                delete foSingleElement.pathh;
                foSingleElement.icon = foSingleElement.icon;
                foMainCategories.push(foSingleElement);
            });
            
            foCacheDetails.foMainCategories = foMainCategories;
        }
        /* Main Category */



        /* Subsctiption Plans */
        var foSubPlansLists = await db.query(
            queryHelper.select(
                '*',
                'subscription_plans',
                "",
            )
        );

        if(foSubPlansLists.length > 0){
            var foSubPlansGroupped = [];
            foSubPlansLists.forEach(foSingleElement => {
                if(foSubPlansGroupped[foSingleElement.plan_id]===undefined){
                    foSubPlansGroupped[foSingleElement.plan_id] = {
                        "plan_id":foSingleElement.plan_id.toString(),
                        "month":foSingleElement.month.toString(),
                        "terms":foSingleElement.month.toString() +" Month",
                        "gst":" GST Included",
                        "plan_name":foSingleElement.plan_name,
                        "price":foSingleElement.price.toString(),
                        "discount_price":foSingleElement.discount_price.toString(),
                        "special_title":foSingleElement.special_title,
                        "status":foSingleElement.status.toString(),
                        "sequence":foSingleElement.sequence,
                        "created_at":foSingleElement.created_at,
                        "description":[]
                    };
                }
                foSubPlansGroupped[foSingleElement.plan_id].description.push({
                    "sub_dis_id": foSingleElement.sub_dis_id.toString(),
                    "plan_id": foSingleElement.plan_id.toString(),
                    "sign": foSingleElement.sign.toString(),
                    "title": foSingleElement.title
                });
            });
            
            var foSubscriptionPlans = [];
            foSubPlansGroupped.forEach(foSingleElement =>{
                if(foSingleElement!=null){
                    foSubscriptionPlans.push(foSingleElement);
                }
            });
            
            foCacheDetails.foSubscriptionPlans = commonHelper.sort_by_key(foSubscriptionPlans,'sequence');
        }
        /* Subsctiption Plans */



        /* Write Cache File */
        var responseJson = await fs.writeFile("./cache/cache.json", JSON.stringify(foCacheDetails), (err) => {
            if (err)
                console.log(err);
            else {
                console.log("File written successfully\n");
            }
        });
        return foCacheDetails[cacheKey];
    }

    // return foCacheDetails;
}