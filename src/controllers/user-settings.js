const md5 = require("md5");
const axios = require("axios");
const FormData = require("form-data");
const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const validation = require("@/helper/validation");
const sms_helper = require("@/helper/sms-helper");
const uploadHelper = require("@/helper/upload-helper");
const commonHelper = require("@/helper/common-helper");
const fileUpload = require("@/utils/fileUpload");

const model = require(`@/models/${config.api_version}/user-settings`);

exports.changePassword = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "user_id_not_0,opass,npass");
  if (errors.length > 0) {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  const responseJson = {
    status: true,
    message: "Password Successfully Updated !!",
    data: [],
  };

  const encOldPassword = md5(req.body.opass + config.SALT);
  const encNewPassword = md5(req.body.npass + config.SALT);

  const passwordStatus = await model.checkOldPassword(req.body.user_id, encOldPassword);
  if (passwordStatus.length > 0) {
    await model.changePassword(req.body.user_id, encNewPassword);
  } else {
    responseJson.status = false;
    responseJson.message = "Old Password Not Match !!";
  }

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.deleteAccount = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "number,pass");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }

  const responseJson = {
    status: true,
    message: "Account Successfully Deleted !!",
    data: [],
  };

  const encOldPassword = md5(req.body.pass + config.SALT);

  const passwordStatus = await model.checkOldPassword(req.body.number, encOldPassword);
  if (passwordStatus.length > 0) {
    await model.deleteAccount(req.body.number);
  } else {
    responseJson.status = false;
    responseJson.message = "Password Not Match !!";
  }

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.addComplain = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "user_id_not_0,subject,message");
  if (errors.length > 0) {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  const responseJson = {
    status: true,
    message: "Successfully !!",
    data: [],
  };

  const checkCompaing = await model.checkExistingComplain(req.body.user_id);
  if (checkCompaing.length > 0) {
    responseJson.status = false;
    responseJson.message = "Your Complaint already exists please try again later, Thank you";
  } else {
    const compaignId = await model.insertComplain(req.body);
    responseJson.message = `Thanks so much for reaching out! we will be in touch within 24 hours with a more complete response. Your Complaint No: ${compaignId}`;
  }

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getUserComplains = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "user_id_not_0");
  if (errors.length > 0) {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  const responseJson = {
    status: true,
    message: "Get Successfully data !!",
    data: await model.getUserComplains(req.body.user_id),
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.submitUserFeedback = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "user_id_not_0,subject");
  if (errors.length > 0) {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  const businessDetails = await model.getBusinessDetails(req.body.user_id);
  await model.insertUserFeedback(req.body);

  sms_helper.sms.send_other_sms(businessDetails[0].mobile, "thanks", "");

  const responseJson = {
    status: true,
    message: `Hey <b>${businessDetails[0].business_name}</b>, thanks for giving us feedback`,
    data: [],
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.saveUserPost = async function (req, res) {
  try {
    /* Validate Request */
    const errors = validation.validate(req.body, "user_id_not_0,temp_id");
    if (errors.length > 0) {
      return res.send(securityHelper.ffp_send_response(req, {
        status: false,
        message: errors.join(", "),
        data: [],
      }));
    }

    // Handle both 'extestion' and 'extension' field names
    const extension = req.body.extestion || req.body.extension;
    
    if (!extension && req.body.image && req.body.image.includes('base64')) {
      return res.send(securityHelper.ffp_send_response(req, {
        status: false,
        message: "Extension field is required for base64 images",
        data: [],
      }));
    }

    const storagePath = "storage/uploads/posts/";
    const dbPath = "uploads/posts/";

    /* Remove Old File If Exist */
    const foUserPost = await model.getUserTempPost(req.body.user_id, req.body.temp_id);
    if (foUserPost.length > 0 && foUserPost[0]?.post) {
      const oldPost = String(foUserPost[0].post || "");
      if (oldPost) {
        const fileName = oldPost.startsWith(dbPath) ? oldPost.replace(dbPath, "") : oldPost;
        uploadHelper.removeImage(storagePath + fileName);
      }
    }

    let fsImageName;
    
    // Check if image is base64 or filename
    if (req.body.image && req.body.image.includes('base64')) {
      // Upload base64 image
      fsImageName = uploadHelper.getFileName(extension, req.body.user_id);
      const fullPath = config.FILE_UPLOAD_PATH + storagePath + fsImageName;
      
      await uploadHelper.uploadBase64Image(fullPath, req.body.image, extension);

      await fileUpload.uploadFileToSpace({
        binaryData: req.body.image,
        keyPath: `${storagePath}${fsImageName}`,
        extestion: extension
      });
    } else if (req.body.image) {
      // Image already uploaded, extract filename only
      const imageStr = String(req.body.image);
      fsImageName = imageStr.replace(dbPath, "").replace(storagePath, "");
    } else {
      return res.send(securityHelper.ffp_send_response(req, {
        status: false,
        message: "Image is required",
        data: [],
      }));
    }
    
    // Store with uploads/posts/ prefix in database
    const dbImagePath = dbPath + fsImageName;
    
    if (foUserPost.length > 0) {
      await model.addUserPost(dbImagePath, req.body.user_id, req.body.temp_id, foUserPost[0].id);
    } else {
      await model.addUserPost(dbImagePath, req.body.user_id, req.body.temp_id, 0);
    }

    const responseJson = {
      status: true,
      message: "Custom Post successfully update!...",
      data: dbImagePath,
    };

    res.send(securityHelper.ffp_send_response(req, responseJson));
  } catch (error) {
    console.error("Error in saveUserPost:", error);
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: error.message || "An error occurred while saving the post",
      data: [],
    }));
  }
};

exports.makeUserPost = async function (req, res) {
  const data = new FormData();
  data.append("tamplate_id", req.body.tamplate_id);
  data.append("business_name", req.body.business_name);
  data.append("name", req.body.name);
  data.append("mobile1", req.body.mobile1);
  data.append("mobile2", req.body.mobile2);
  data.append("email", req.body.email);
  data.append("website", req.body.website);
  data.append("address", req.body.address);
  data.append("logo", req.body.logo);
  data.append("birthdayPhoto", req.body.birthdayPhoto);
  data.append("birthdayName", req.body.birthdayName);
  data.append("user_id", req.body.user_id);

  axios.post(config.MAKE_POST_BY_USER_PHP, data).then((response) => {
    res.send(securityHelper.ffp_send_response(req, response.data));
  }).catch((error) => {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: error,
      data: [],
    }));
  });
};

exports.applyCouponCode = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "user_id_not_0,coupon");
  if (errors.length > 0) {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  const responseJson = {
    status: true,
    message: "Custom Post successfully update!...",
    data: [],
  };

  /* Get Active Coupon */
  const foActiveCoupon = await model.getActiveCoupon(req.body.coupon);

  /* check user paid or not */
  const foIsUserPaid = await model.checkUserPaid(req.body.user_id);

  if (foActiveCoupon.length > 0 && foIsUserPaid.length > 0) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(foActiveCoupon[0].total_days));

    /* Payment Log */
    const foPaymentData = {
      user_id: req.body.user_id,
      amount: "0.00",
      date: config.ONLY_DATE(),
      transactionid: "",
      status: foActiveCoupon[0].title,
      packageid: "1",
      price: "0.00",
      month: "0",
      created_at: config.CURRENT_DATE(),
    };
    await model.insertData("payments", foPaymentData);

    /* Coupon code log */
    const foCouponData = {
      user_id: req.body.user_id,
      coupon_id: foActiveCoupon[0].id,
      created_at: config.CURRENT_DATE(),
    };
    await model.insertData("coupon_code_appy_user", foCouponData);

    /* Update User Payment data */
    const userPaidData = {
      ispaid: "1",
      expdate: commonHelper.formatDate(expiryDate),
      planStatus: "1",
    };
    console.log(userPaidData);
    await model.updatePaymentData(userPaidData, req.body.user_id);

    /* Update Coupon Use Count */
    await model.updateCouponUseCount(foActiveCoupon[0].id);
    responseJson.message = "This coupon has been successfully activated";
  } else {
    responseJson.status = false;
    /* just for proper message */
    if (foActiveCoupon.length <= 0 && foIsUserPaid.length <= 0) {
      responseJson.message = "This coupon has expired....";
    } else if (foActiveCoupon.length <= 0) {
      responseJson.message = "This coupon has expired....";
    } else if (foIsUserPaid.length <= 0) {
      responseJson.message = "This is not for you, Only for new user..";
    }
  }

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getCouponCode = async function (req, res) {
  const foCouponCodeLists = await model.getCouponCode();
 
  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foCouponCodeLists.length > 0 ? foCouponCodeLists : [],
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
