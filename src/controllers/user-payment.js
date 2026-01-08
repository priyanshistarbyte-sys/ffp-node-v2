const md5 = require("md5");
const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const validation = require("@/helper/validation");

const model = require(`@/models/${config.api_version}/user-payment`);

exports.userPurchasePackage = async function (req, res) {
  /* Validate Request */
  // status,transactionid
  const errors = validation.validate(req.body, "user_id_not_0,amount,packageid");
  if (errors.length > 0) {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  let referral_code = req.body.referral_code ? req.body.referral_code : null;

  const response = await model.userPurchasePackage(req.body.user_id, req.body.amount, req.body.transactionid, req.body.status, req.body.packageid, {referral_code:referral_code});
  const responseJson = {
    status: response.status,
    message: response.message,
    data: [],
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
