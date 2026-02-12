const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const commonHelper = require("@/helper/common-helper");
const cacheManager = require("@/helper/cache-manager");

const model = require(`@/models/${config.api_version}/posts`);
const categories = require(`@/models/${config.api_version}/categories`);
const { API_BASE_URL } = process.env;

exports.getHomeScreenData = async function (req, res) {
  /* Get Today Posts */
  const foTodayPostsLists = await model.getTodayPosts(config.POSTLIMIT);
  const foTodayPosts = [];
  if (foTodayPostsLists.length > 0) {
    foTodayPostsLists.forEach((foSingleElement) => {
      foSingleElement.event_date = foSingleElement.event_date != "0000-00-00" ? commonHelper.customFormatDate(foSingleElement.event_date, "d, F Y") : "";

      let plan = "no";
      let auto = "yes";
      if (foSingleElement.planImgName != "") {
        plan = "yes";
        foSingleElement.pathB = `media/template/plan/${foSingleElement.mslug}/${foSingleElement.tid}.jpg`;
        foSingleElement.thumb = `media/template/plan/thumb/${foSingleElement.tid}.jpg`;
      } else {
        if (foSingleElement.plan_auto == 1 || foSingleElement.plan_auto == "1") {
          plan = "yes";
          auto = "no";
          foSingleElement.pathB = `media/template/${foSingleElement.path}`;
        } else {
          plan = "no";
          foSingleElement.pathB = `media/template/${foSingleElement.path}`;
        }
        foSingleElement.thumb = `media/template/thumb/${foSingleElement.path}`;
      }
      foSingleElement.automaticTempB = `media/template/${foSingleElement.path}`;
      foSingleElement.mask = `media/template/${foSingleElement.mask}`;
      foSingleElement.plan = plan;
      foSingleElement.auto = auto;

      delete foSingleElement.created_at;
      delete foSingleElement.mslug;
      delete foSingleElement.path;
      delete foSingleElement.plan_auto;
      delete foSingleElement.planImgName;
      delete foSingleElement.updated_at;

      foTodayPosts.push(foSingleElement);
    });
  }
  /* Get Today Posts */

  /* Get UpComing Posts */
  const foUpComingPostsLists = await model.getUpcomingPosts(config.POSTLIMIT);
  const foUpComingPosts = [];
  if (foUpComingPostsLists.length > 0) {
    foUpComingPostsLists.forEach((foSingleElement) => {
      foSingleElement.event_date = foSingleElement.event_date != "0000-00-00" ? commonHelper.customFormatDate(foSingleElement.event_date, "d, F Y") : "";
      if (foSingleElement.image != "") {
        foSingleElement.thumb = `${API_BASE_URL}/storage/${foSingleElement.image}`;
        foSingleElement.image = `${API_BASE_URL}/storage/${foSingleElement.image}`;

      } else {
        foSingleElement.image =  `${API_BASE_URL}/assets/images/default.jpg`; 
        foSingleElement.thumb = `${API_BASE_URL}/assets/images/default.jpg`;
      }
      // if(foSingleElement.plan_auto==null){
      //     foSingleElement.plan_auto = "1";
      // }
      foUpComingPosts.push(foSingleElement);
    });
  }   
  /* Get UpComing Posts */

  /* Today Video Posts */
  const foTodayVideoLists = await model.getTodayVideoPost(config.POSTLIMIT);
  const foTodayVideo = [];
  if (foTodayVideoLists.length > 0) {
    foTodayVideoLists.forEach((foSingleElement) => {
      foSingleElement.path = foSingleElement.path != "" ? `media/videogif/${foSingleElement.path}` : "";
      foSingleElement.event_date = commonHelper.formatDate(foSingleElement.event_date);
      foSingleElement.event_date = foSingleElement.event_date != "0000-00-00" ? commonHelper.customFormatDate(foSingleElement.event_date, "d, F Y") : "";
      if (foSingleElement.thumb != "") {
        foSingleElement.thumb = `${API_BASE_URL}/storage/${foSingleElement.thumb}`;
      } else {
        foSingleElement.thumb = `${API_BASE_URL}/assets/images/default.jpg`;
      }
      foTodayVideo.push(foSingleElement);
    });
  }
  /* Today Video Posts */

  const foHomeSlider = await cacheManager.getDataFromCache("foAppSlider");

  /* Home Category Wise Post Lists */
  const foCategoryGroup = await categories.getHomePagePostsListWithCategoryGroup(5);

  const foAllCategories = await cacheManager.getDataFromCache("foMainCategories");

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: {
      today_posts: foTodayPosts,
      upcoming_posts: foUpComingPosts,
      today_videos: foTodayVideo,
      home_slider: foHomeSlider,
      category_posts: foCategoryGroup,
      category_list: foAllCategories,
    },
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getTodayPosts = async function (req, res) {
  /* Get Today Posts */
  const foTodayPostsLists = await model.getTodayPosts();
  const foTodayPosts = [];
  if (foTodayPostsLists.length > 0) {
    foTodayPostsLists.forEach((foSingleElement) => {
      foSingleElement.event_date = foSingleElement.event_date != "0000-00-00" ? commonHelper.customFormatDate(foSingleElement.event_date, "d, F Y") : "";

      let plan = "no";
      let auto = "yes";
      if (foSingleElement.planImgName != "") {
        plan = "yes";
        foSingleElement.thumb = `media/template/plan/thumb/${foSingleElement.tid}.jpg`;
        foSingleElement.pathB = `media/template/plan/${foSingleElement.mslug}/${foSingleElement.tid}.jpg`;
      } else {
        if (foSingleElement.plan_auto == 1 || foSingleElement.plan_auto == "1") {
          plan = "yes";
          auto = "no";
          foSingleElement.pathB = `${API_BASE_URL}/storage/${foSingleElement.path}`;
        } else {
          plan = "no";
          foSingleElement.pathB = `${API_BASE_URL}/storage/${foSingleElement.path}`;
        }
        foSingleElement.thumb = `${API_BASE_URL}/storage/${foSingleElement.path}`; 
      }
      foSingleElement.automaticTempB = `${API_BASE_URL}/storage/${foSingleElement.path}`;
      foSingleElement.mask =  `${API_BASE_URL}/storage/${foSingleElement.mask}`;
      foSingleElement.plan = plan;
      foSingleElement.auto = auto;

      delete foSingleElement.created_at;
      delete foSingleElement.mslug;
      delete foSingleElement.path;
      delete foSingleElement.plan_auto;
      delete foSingleElement.planImgName;
      delete foSingleElement.updated_at;

      foTodayPosts.push(foSingleElement);
    });
  }
  /* Get Today Posts */

  /* Today Video Posts */
  const foTodayVideoLists = await model.getTodayVideoPost();
  const foTodayVideo = [];
  if (foTodayVideoLists.length > 0) {
    foTodayVideoLists.forEach((foSingleElement) => {
      foSingleElement.path = foSingleElement.path != "" ?  `${API_BASE_URL}/storage/${foSingleElement.path}`: "";
      foSingleElement.event_date = commonHelper.formatDate(foSingleElement.event_date);
      foSingleElement.event_date = foSingleElement.event_date != "0000-00-00" ? commonHelper.customFormatDate(foSingleElement.event_date, "d, F Y") : "";
      if (foSingleElement.thumb != "") {
        foSingleElement.thumb =  `${API_BASE_URL}/storage/${foSingleElement.thumb}`; 
      } else {
        foSingleElement.thumb = `${API_BASE_URL}/assets/images/default.jpg`;
      }
      foTodayVideo.push(foSingleElement);
    });
  }
  /* Today Video Posts */

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: {
      videos: foTodayVideo,
      posts: foTodayPosts,
    },
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getUpcomingPosts = async function (req, res) {
  /* Get UpComing Posts */
  const foUpComingPostsLists = await model.getUpcomingPosts();
  const foUpComingPosts = [];
  if (foUpComingPostsLists.length > 0) {
    foUpComingPostsLists.forEach((foSingleElement) => {
      foSingleElement.event_date = foSingleElement.event_date != "0000-00-00" ? commonHelper.customFormatDate(foSingleElement.event_date, "d, F Y") : "";
      if (foSingleElement.image != "") {
        foSingleElement.thumb = `${API_BASE_URL}/storage/${foSingleElement.image}`;
        foSingleElement.image = `${API_BASE_URL}/storage/${foSingleElement.image}`;
      } else {
        foSingleElement.thumb = `${API_BASE_URL}/assets/images/default.jpg`; 
        foSingleElement.image = `${API_BASE_URL}/assets/images/default.jpg`; 
      }
      // if(foSingleElement.plan_auto==null){
      //     foSingleElement.plan_auto = "1";
      // }
      foUpComingPosts.push(foSingleElement);
    });
  }
  /* Get UpComing Posts */

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foUpComingPosts,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
