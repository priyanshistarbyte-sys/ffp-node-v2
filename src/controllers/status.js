const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const commonHelper = require("@/helper/common-helper");
const validation = require("@/helper/validation");

const model = require(`@/models/${config.api_version}/status`);

exports.getStatusCategories = async function (req, res) {
  const foStatusCat = [];
  const foStatusCatLists = await model.getStatusCategories();
  if (foStatusCatLists.length > 0) {
    foStatusCatLists.forEach((foSingleElement) => {
      foSingleElement.thumb = foSingleElement.image != "" ? `media/photocategory/thumb/${foSingleElement.image}` : "";
      foSingleElement.image = foSingleElement.image != "" ? `media/photocategory/${foSingleElement.image}` : "";
      foSingleElement.sub = 0;
      foStatusCat.push(foSingleElement);
    });
  }

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foStatusCat,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getStatusPhotos = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "id,limit");
  if (errors.length > 0) {
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: errors.join(", "),
      data: [],
    }));
  }

  const foSubFrames = [];
  const foSubFramesList = await model.getStatusPhotos(req.body.id, req.body.limit);
  // console.log("foSubFramesList",foSubFramesList);
  if (foSubFramesList.length > 0) {
    foSubFramesList.forEach((foSingleElement) => {
      foSingleElement.created_at = foSingleElement.created_at == "0000-00-00" ? "" : commonHelper.formatDateWithSpash(foSingleElement.created_at);
      foSingleElement.thumb = foSingleElement.photo != "" ? `media/photo/thumb/${foSingleElement.photo}` : "";
      foSingleElement.photo = foSingleElement.photo != "" ? `media/photo/${foSingleElement.photo}` : "";
      foSubFrames.push(foSingleElement);
    });
  }

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foSubFrames,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
