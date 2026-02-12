const md5 = require("md5");
const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const validation = require("@/helper/validation");
const db = require("@/config/database");
const queryHelper = require("@/helper/query-helper");

const model = require(`@/models/${config.api_version}/user-payment`);

exports.userPurchasePackage = async function (req, res) {
  /* Validate Request */
  // status,transactionid
  const errors = validation.validate(req.body, "user_id_not_0,amount,packageid");
  if (errors.length > 0) {
    return res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  const [userData] = await db.query(
    queryHelper.select('used_referral_code', 'admin', { id: req.body.user_id }, '', 1)
  );

  let referral_code = userData.length && userData[0].used_referral_code ? userData[0].used_referral_code : null;
  let coupon_code = req.body.coupon_code ? req.body.coupon_code : null;

  const response = await model.userPurchasePackage(req.body.user_id, req.body.amount, req.body.transactionid, req.body.status, req.body.packageid, {referral_code:referral_code, coupon_code:coupon_code});
  const responseJson = {
    status: response.status,
    message: response.message,
    data: [],
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
