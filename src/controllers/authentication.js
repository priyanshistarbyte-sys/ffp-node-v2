const jwt = require("jsonwebtoken");
const md5 = require("md5");
const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const commonHelper = require("@/helper/common-helper");
const validation = require("@/helper/validation");
const smsHelper = require("@/helper/sms-helper");

const authenticationModel = require(`@/models/${config.api_version}/authentication`);
const userProfileModel = require(`@/models/${config.api_version}/user-profile`);

exports.userLogin = async function (req, res) {
  const errors = validation.validate(req.body, "mobile,password,contryCode");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: [],
  };

  const foUserList = await authenticationModel.userLogin(req.body.mobile, req.body.password, req.body.contryCode);
  // console.log('Login query result:', foUserList);
  // Handle MySQL2 result format [rows, fields]
  const users = Array.isArray(foUserList[0]) ? foUserList[0] : foUserList;
  if (users.length > 0) {
    const foUser = users[0];
    console.log('User found, status:', foUser.status);
    if (foUser.status != 1) {
      responseJson.message = "Sorry your account is temporarily locked. please try again later.";
      responseJson.status = false;
    } else {
      const accessToken = await jwt.sign({ device_id: req.body.device_id, user_id: foUser.id }, config.jwt_secret, { expiresIn: "30d" });

      foUser.last_login = foUser.last_login !== "0000-00-00 00:00:00" ? commonHelper.customFormatDate(foUser.last_login, "d/m/Y H:i") : "";
      foUser.created_at = commonHelper.customFormatDate(foUser.created_at, "d/m/Y H:i");
      foUser.updated_at = commonHelper.customFormatDate(foUser.updated_at, "d/m/Y H:i");
      foUser.gender = foUser.gender == 0 ? "Male" : "Female";
      //foUser.photo = foUser.photo !== "" ? `media/logo/${foUser.photo}` : "";
      foUser.auth_token = accessToken;
      foUser.payments = await authenticationModel.getPaymentData(foUser.id);

      await authenticationModel.updateLastLogin(foUser.id);
      responseJson.data = foUser;
    }
  } else {
    responseJson.status = false;
    responseJson.message = "Invalid mobile or password!";
  }

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.forgotRegisterSendOTP = async function (req, res) {
  const errors = validation.validate(req.body, "page,mobile,sshcode");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }

  const userMobile = req.body.mobile.trim();
  if (userMobile.length != 10) {
    return validation.errorMessageWithMessage(req, res, "Your mobile number is wrong, Please enter a valid 10-digit mobile number");
  }
  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: "",
  };

  const requestBody = req.body;
  const mobileExist = await authenticationModel.checkIsMobileExist(req.body.mobile);
  if ((mobileExist && requestBody.page === "forgotpassword") || (!mobileExist && requestBody.page === "signup")) {
    const otp = (`000000${Math.floor((Math.random() * 1000000) + 1)}`).slice(-6);
    responseJson.data = otp;
    await authenticationModel.smsLogUpdate(requestBody.page, requestBody.mobile, otp);
    smsHelper.sms.send_otp_sms(requestBody.mobile, otp, requestBody.page, "91", requestBody.sshcode);
  } else {
    responseJson.status = false;
    responseJson.message = requestBody.page === "forgotpassword" ? "This mobile does not exist" : "exist"; /* this string fix please do not change 'exist' */
  }
  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.updatePassword = async function (req, res) {
  const errors = validation.validate(req.body, "mobile,npass");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }

  const responseJson = {
    status: true,
    message: "Password Successfully Updated !!",
    data: [],
  };

  const encNewPassword = md5(req.body.npass + config.SALT);
  const mobileExist = await authenticationModel.checkIsMobileExist(req.body.mobile);
  if (mobileExist) {
    await authenticationModel.updatePassword(req.body.mobile, encNewPassword);
  } else {
    responseJson.status = false;
    responseJson.message = "User is not authorized to use.";
  }

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.userRegister = async function (req, res) {
  const errors = validation.validate(req.body, "mobile,password");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }

  const responseJson = {
    status: true,
    message: "Register Successfully!",
    data: [],
  };

  const mobileCheck = await authenticationModel.checkIsMobileExist(req.body.mobile);
  console.log(mobileCheck);
  if (mobileCheck) {
    responseJson.status = false;
    responseJson.message = "This mobile number is already registered";
  } else {
    const fiUserId = await authenticationModel.userRegister(req.body);
    if (fiUserId > 0) {
      responseJson.data = await userProfileModel.getUserProfile(fiUserId);
      const accessToken = await jwt.sign({ device_id: req.body.device_id, user_id: fiUserId }, config.jwt_secret, { expiresIn: "30d" });
      responseJson.data.auth_token = accessToken;
    } else {
      responseJson.status = false;
      responseJson.message = "Something went wrong during user registration. Try to contact the system admin!";
    }
  }

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
