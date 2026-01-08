const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const validation = require("@/helper/validation");
const cacheManager = require("@/helper/cache-manager");

const categoryModel = require(`@/models/${config.api_version}/categories`);

exports.getCategoryWisePostSubCatData = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "category_id");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }

  // var foSubCategories = await categoryModel.getSubCategories(req.body.c_id);
  const [foTemplates, foAllVideos] = await Promise.all([
    categoryModel.getLast10ByCategoryIdTemplate(req.body.category_id, req.body.limit),
    categoryModel.getAllVideoByCategoryID(req.body.category_id),
  ]);

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: {
      // 'sub_categories':foSubCategories,
      // 'templates':foTemplates,
      posts: foTemplates,
      videos: foAllVideos,
    },
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getAllCategories = async function (req, res) {
  const foAllCategories = await cacheManager.getDataFromCache("foMainCategories");

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foAllCategories,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getSubCategories = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "category_id");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }

  const foAllSubCategories = await categoryModel.getSubCategories(req.body.category_id);

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foAllSubCategories,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
