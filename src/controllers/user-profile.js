const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const validation = require("@/helper/validation");

const model = require(`@/models/${config.api_version}/user-profile`);

exports.updateProfile = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "user_id_not_0");
  if (errors.length > 0) {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  await model.updateProfile(req.body);

  const responseJson = {
    status: true,
    message: "Your profile successfully update!",
    data: await model.getUserProfile(req.body.user_id),
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getUserProfile = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "user_id_not_0");
  if (errors.length > 0) {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  const foUser = await model.getUserProfile(req.body.user_id);
  foUser.userPostList = await model.getUserPosts(req.body.user_id);
  const responseJson = {
    status: true,
    message: "Successfully get!....",
    data: foUser,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.uploadLogo = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "user_id_not_0,image,extestion");
  if (errors.length > 0) {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  const logoName = await model.uploadLogo(req.body);

  const responseJson = {
    status: true,
    message: "Your profile successfully update!",
    data: logoName,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
