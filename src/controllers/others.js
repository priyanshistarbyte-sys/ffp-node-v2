const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const cacheManager = require("@/helper/cache-manager");

const model = require(`@/models/${config.api_version}/others`);

exports.getSubscriptionPlanLists = async function (req, res) {
  const foSubscriptionPlans = await cacheManager.getDataFromCache("foSubscriptionPlans");
  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foSubscriptionPlans,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getFAQs = async function (req, res) {
  const foFAQsLists = await model.getFAQs();
  const foFAQs = [];
  if (foFAQsLists.length > 0) {
    foFAQsLists.forEach((foSingleElement) => {
      foSingleElement.img = foSingleElement.img != "" ? `media/faq/${foSingleElement.img}` : "";
      foFAQs.push(foSingleElement);
    });
  }
  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foFAQs.length > 0 ? foFAQs : "Data not found!....",
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.setVideoAnylitics = async function (req, res) {
  await model.setVideoAnylitics();

  const responseJson = {
    status: true,
    message: "Successfully Updated",
    data: [],
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getNotifications = async function (req, res) {
  const foNotifications = await model.getNotifications();

  const responseJson = {
    status: true,
    message: "Successfully Updated",
    data: foNotifications,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
