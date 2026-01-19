const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const validation = require("@/helper/validation");
const upload = require("@/helper/upload-helper");

const fileUpload = require("@/utils/fileUpload");

const model = require(`@/models/${config.api_version}/family`);
const { API_BASE_URL } = process.env;

exports.getFamilyCategories = async function (req, res) {
  const foFamilyCatLists = await model.getFamilyCategories();
  
  const foFamilyCat = [];
  foFamilyCatLists?.forEach((foSingleElement) => {
    Object.values(foSingleElement).forEach((record) => {
      if (record && typeof record === 'object' && record.id) {
        const thumb = record.image ? `${API_BASE_URL}/storage/${record.image}` : "";
        const image = record.image ? `${API_BASE_URL}/storage/${record.image}` : "";
        foFamilyCat.push({
          ...record, thumb, image, sub: 0,
        });
      }
    });
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
