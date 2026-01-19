const db = require('@/config/database');
const config = require('@/config/config');
const queryHelper = require('./query-helper');
const commonHelper = require('./common-helper');
const fs = require("fs").promises;

const { API_BASE_URL } = process.env;

exports.getDataFromCache = async (cacheKey) => {
    var fbIsCacheExist = true;
    var foCacheDetails = {};

    try {
        var fileCache = await fs.readFile("./src/cache/cache.json", "binary"); 
        fileCache = JSON.parse(fileCache);
        return fileCache[cacheKey];
    } catch (error) {
        fbIsCacheExist = false;
    }
    
    // fbIsCacheExist = false; // False if ignore caching


    /* Create New Cache */
    if(fbIsCacheExist===false){

        try {
            /* getNewAdsmobList */
            console.log('Starting getNewAdsmobList query...');
            var foApplicationAd = await db.query(
                queryHelper.select(
                    'id,status,adclick,mode',
                    'application_add',
                    {}
                )
            );
            console.log('foApplicationAd result:', foApplicationAd);

            if(foApplicationAd.length > 0){
                foApplicationAd = foApplicationAd[0];
                foApplicationAd.openadd="1";
                foApplicationAd.backadd="1";

                /* Get Add Type */
                var foAdsListAll = await db.query(
                    queryHelper.select(
                        'ads_title,ads_id,ads_type',
                        'ads_api',
                        {'app_id':foApplicationAd.id}
                    )
                );
                
                var foResult = {google:{},facebook:{},dailog:{}};
                foAdsListAll.forEach(element => {
                    var type = element.ads_type=="1"?'google' : 'facebook';
                    foResult[type][element.ads_title]=element.ads_id;
                });


                var foDialog = await db.query(
                    queryHelper.select(
                        'title,description,button1,button2,link,image,appversion,forcefully,other_forcefully,isDisplay,other_isDisplay,o_type,o_link',
                        'dailog',
                        {}
                    )
                );

                if(foDialog.length > 0){
                    foDialog[0].image = foDialog[0].image && foDialog[0].image !== '' ? 
                        `${API_BASE_URL}/storage/uploads/images/application_dailog_image/${foDialog[0].image}` : '';
                    foResult.dailog = foDialog[0];
                }

                foApplicationAd.result = {};
                foApplicationAd.result = foResult;
                foCacheDetails.getNewAdsmobList = foApplicationAd;
            } else {
                /* No application data found, create default structure */
                foCacheDetails.getNewAdsmobList = {
                    openadd: "1",
                    backadd: "1",
                    result: {google:{}, facebook:{}, dailog:{}}
                };
            }
        } catch (error) {
            console.log('Error in getNewAdsmobList:', error.message);
            foCacheDetails.getNewAdsmobList = {
                openadd: "1",
                backadd: "1",
                result: {google:{}, facebook:{}, dailog:{}}
            };
        }
        /* getNewAdsmobList */

        
        /* appMasterAP */
         var foAllSettingData = await db.query(
            queryHelper.select(
                'id, option_name,value',
                'setting',
                {}
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
                "sharingBanner" : foAllSetting['sharingBanner'] && foAllSetting['sharingBanner'] !== '' ? 
                    `${API_BASE_URL}/storage/uploads/images/sharing_banner/${foAllSetting['sharingBanner']}` : '',
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
                'title,image,mid,sub,url,sort,festivalDate',
                'appslider',
                {'status':1},
                "sort asc"
            )
        );

        console.log('foAppSliderData from DB:', foAppSliderData);

        if(foAppSliderData.length > 0){
            var foAppSlider = [];
            // Handle MySQL2 result format
            const sliderData = Array.isArray(foAppSliderData[0]) ? foAppSliderData[0] : foAppSliderData;
            sliderData.forEach(foSingleElement => {
                foSingleElement.festivalDate = commonHelper.formatDate(foSingleElement.festivalDate);
                // Handle full path images from database
                if(foSingleElement.image && foSingleElement.image !== '' && foSingleElement.image !== '0') {
                    foSingleElement.image = `${API_BASE_URL}/storage/${foSingleElement.image}`;
                } else {
                    foSingleElement.image = `${API_BASE_URL}/assets/images/default.jpg`;
                }
                foAppSlider.push(foSingleElement);
            });
            
            console.log('Processed foAppSlider:', foAppSlider);
            foCacheDetails.foAppSlider = foAppSlider;
        }
        /* Home Screen Slider */


        /* Main Category */
        var foMainCategoryLists = await db.query(
            queryHelper.select(
                '*',
                'all_main_categories',
                {}
            )
        );

        if(foMainCategoryLists.length > 0){
            var foMainCategories = [];
            foMainCategoryLists.forEach(foSingleElement => {
                if(foSingleElement.sub=="1" || foSingleElement.sub==1){
                    foSingleElement.sub_category_id = foSingleElement.category_id;
                    foSingleElement.image = foSingleElement.image;
                    foSingleElement.thumb = foSingleElement.image;
                }else{
                    if(foSingleElement.image!=""){
                        foSingleElement.thumb = `${API_BASE_URL}/storage/${foSingleElement.image}`;
                        foSingleElement.image = `${API_BASE_URL}/storage/${foSingleElement.image}`;
                    }else{
                        foSingleElement.thumb = `${API_BASE_URL}/assets/images/default.jpg`;
                        foSingleElement.image = `${API_BASE_URL}/assets/images/default.jpg`;
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
        try {
            var foSubPlansLists = await db.query(
                queryHelper.select(
                    '*',
                    'subscription_plans_view',
                    {}
                )
            );

            if (foSubPlansLists.length > 0) {

                var foSubPlansGroupped = {};

                foSubPlansLists.forEach(foSingleElement => {

                    if (foSubPlansGroupped[foSingleElement.plan_id] === undefined) {

                        foSubPlansGroupped[foSingleElement.plan_id] = {
                            "plan_id": (foSingleElement.plan_id || '').toString(),
                            "duration": (foSingleElement.duration || '').toString(),
                            "duration_type": foSingleElement.duration_type || '',
                            "terms": `${foSingleElement.duration || ''} ${foSingleElement.duration_type || ''}`,
                            "gst": " GST Included",
                            "plan_name": foSingleElement.plan_name || '',
                            "price": (foSingleElement.price || '').toString(),
                            "discount_price": (foSingleElement.discount_price || '').toString(),
                            "discount": (foSingleElement.discount || '').toString(),
                            "special_title": foSingleElement.special_title || '',
                            "is_free": (foSingleElement.is_free || 0).toString(),
                            "status": (foSingleElement.status || '').toString(),
                            "sequence": foSingleElement.sequence || 0,
                            "created_at": foSingleElement.created_at || '',
                            "description": []
                        };
                    }

                    foSubPlansGroupped[foSingleElement.plan_id].description.push({
                        "sub_dis_id": (foSingleElement.sub_dis_id || '').toString(),
                        "plan_id": (foSingleElement.plan_id || '').toString(),
                        "sign": (foSingleElement.sign || '').toString(),
                        "title": foSingleElement.title || ''
                    });
                });

                var foSubscriptionPlans = Object.values(foSubPlansGroupped);

                foCacheDetails.foSubscriptionPlans =
                    commonHelper.sort_by_key(foSubscriptionPlans, 'sequence');
            }
        } catch (error) {
            console.log('Error in subscription plans:', error.message);
            foCacheDetails.foSubscriptionPlans = [];
        }

        /* Subsctiption Plans */

        /* Write Cache File */
        var responseJson = await fs.writeFile("./src/cache/cache.json", JSON.stringify(foCacheDetails), (err) => {
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