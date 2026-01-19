const jwt = require("jsonwebtoken");
const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const validation = require("@/helper/validation");
const commonHelper = require("@/helper/common-helper");
const cacheManager = require("@/helper/cache-manager");
const sms_helper = require("@/helper/sms-helper");

//const model = require('@/models/'+config.api_version+'/user-details');

const userDetailModel = require(`@/models/${config.api_version}/user-details`);
const authenticationmModel = require(`@/models/${config.api_version}/authentication`);

exports.getGlobalSetting = async function (req, res) {
  console.log("config");
  /* Validate Request */
  const errors = validation.validate(req.body, "app_version,oprating_system,device_id,user_id");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }

  /* Process Request */
  const foSpashScreen = await cacheManager.getDataFromCache("getNewAdsmobList");
  const foAppAccountSetting = await cacheManager.getDataFromCache("appMasterAP");

  foAppAccountSetting.mobile = "";
  foAppAccountSetting.b_email = "";
  foAppAccountSetting.business_category_id = null;
  foAppAccountSetting.isAbleToSubmitFreePost = false;
  foAppAccountSetting.isAbleToSubmitFreePostCount = config.FREE_POST_LIMIT;

  /* Check User Plan */
  if (req?.body?.user_id > 0) {
    authenticationmModel.updateLastLogin(req.body.user_id);
    let foUserPlan = await userDetailModel.checkUserPlan(req.body.user_id);
    if (foUserPlan.length > 0) {
      console.log("foUserPlan", foUserPlan);
      foUserPlan = foUserPlan[0];
      // foAppAccountSetting.expdate = foUserPlan.expdate;
      foAppAccountSetting.userstatus = foUserPlan.status;
      foAppAccountSetting.userIsPaid = foUserPlan.ispaid;
      foAppAccountSetting.mobile = foUserPlan.mobile;
      //foAppAccountSetting.isAbleToSubmitFreePost = false;
      foAppAccountSetting.b_email = foUserPlan.b_email;
      foAppAccountSetting.business_category_id = foUserPlan.business_category_id;
      if (foUserPlan.ispaid == 1 && foUserPlan.expdate != null && foUserPlan.expdate != "" && foUserPlan.expdate != "0000-00-00") {
        foAppAccountSetting.expirydate = commonHelper.formatDateWithSpash(foUserPlan.expdate);
        if (new Date(foUserPlan.expdate) >= new Date(config.ONLY_DATE())) {
          let foPanDetails = await userDetailModel.getUserPlanDetails(req.body.user_id);
          if (foPanDetails.length > 0) {
            foPanDetails = foPanDetails[0];
            foAppAccountSetting.userPlanActiveName = foPanDetails.plan_name;
          }
        } else {
          /* Expiry User Plan */
          await userDetailModel.planExpired(req.body.user_id);
          console.log("sandip------mobile", foUserPlan.mobile);
          sms_helper.sms.send_other_sms(foUserPlan.mobile, "planexpired", "");

        }
      }else{
        if (foUserPlan.ispaid == 0 && foUserPlan.expdate == null && foUserPlan.planStatus == null) {
          if(foUserPlan.free_post_count < config.FREE_POST_LIMIT){
            foAppAccountSetting.isAbleToSubmitFreePost = true;
          }
        }
      }
    }
  }

  if ((req?.body?.user_id === 0 || req?.body?.user_id === "0") && foSpashScreen?.result?.dailog) {
    foSpashScreen.result.dailog.image = "media/dailog/top_free_users.png";
  }
  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: {
      splash_screen: foSpashScreen,
      account_setting: foAppAccountSetting,
    },
  };

  const user_id = parseInt(req.body.user_id);
  const accessToken = await jwt.sign({ device_id: req.body.device_id, user_id }, config.jwt_secret, { expiresIn: "30d" });

  responseJson.data.auth_token = accessToken;

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.syncFirebaseToken = async function (req, res) {
  console.log("req.body", req.body);
  /* Validate Request */
  const errors = validation.validate(req.body, "app_version,oprating_system,device_id,user_id,fcm_token");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }
  const userToken = {
    user_id: req.body.user_id,
    oprating_system: req.body.oprating_system,
    app_version: req.body.app_version,
    token: req.body.fcm_token !== undefined ? req.body.fcm_token : "",
    device_id: req.body.device_id,
    updated_at: config.CURRENT_DATE(),
  };

  if (req.body.user_id === 0 || req.body.user_id === "0") {
    /* User as guest so no need to check user id, Just compare with device id and update data according it */
    const foTokenExist = await userDetailModel.checkUserTokenExistWithDevice({ device_id: req.body.device_id });
    if (foTokenExist.length > 0) {
      /* Update Token Data */
      delete userToken.user_id;
      await userDetailModel.updateUserToken(userToken, { id: foTokenExist[0].id });
    } else {
      /* Add Token Data */
      await userDetailModel.insertUserToken(userToken);
    }
  } else {
    /* Check User Id Exist so just update device info */
    const foTokenExist = await userDetailModel.checkTokenWithUserOrDevice(req.body.user_id, req.body.device_id);
    if (foTokenExist.length > 0) {
      /* Update Token Data */
      await userDetailModel.updateUserToken(userToken, { id: foTokenExist[0].id });
    } else {
      /* Add Token Data */
      await userDetailModel.insertUserToken(userToken);
    }
  }

  const responseJson = {
    status: true,
    message: "Device Id update successfully...",
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
