const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const validation = require("@/helper/validation");
const upload = require("@/helper/upload-helper");

const fileUpload = require("@/utils/fileUpload");

const model = require(`@/models/${config.api_version}/family`);

exports.getFamilyCategories = async function (req, res) {
  const foFamilyCatLists = await model.getFamilyCategories();
  const foFamilyCat = foFamilyCatLists?.map((foSingleElement) => {
    const thumb = foSingleElement.image !== "" ? `media/category/thumb/${foSingleElement.image}` : "";
    const image = foSingleElement.image !== "" ? `media/category/${foSingleElement.image}` : "";
    return {
      ...foSingleElement, thumb, image, sub: 0,
    };
  });

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foFamilyCat,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.uploadBirthDayBase64Image = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "image,extestion");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }

  const imagePath = "media/birthday_user/";
  const fileName = upload.getFileName(req.body.extestion);

  await upload.uploadBase64Image(imagePath, req.body.image, req.body.extestion);

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: fileName,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
