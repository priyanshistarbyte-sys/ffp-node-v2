const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const commonHelper = require("@/helper/common-helper");
const validation = require("@/helper/validation");

const model = require(`@/models/${config.api_version}/status`);
const { API_BASE_URL } = process.env;

exports.getStatusCategories = async function (req, res) {
  const foStatusCat = [];
  const foStatusCatLists = await model.getStatusCategories();
  if (foStatusCatLists.length > 0) {
    foStatusCatLists.forEach((foSingleElement) => {
      Object.values(foSingleElement).forEach((record) => {
        if (record && typeof record === 'object' && record.id) {
          const thumb = record.image ? `${API_BASE_URL}/storage/${record.image}` : "";
          const image = record.image ? `${API_BASE_URL}/storage/${record.image}` : "";
          foStatusCat.push({
          ...record, thumb, image, sub: 0,
        });
        }
      });
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
    return res.send(
      securityHelper.ffp_send_response(req, {
        status: false,
        message: errors.join(", "),
        data: [],
      })
    );
  }

  const foSubFrames = [];
  const foSubFramesList = await model.getStatusPhotos(req.body.id, req.body.limit);

  if (foSubFramesList?.length > 0) {
    foSubFramesList.forEach((row) => {

      Object.values(row).forEach((record) => {
        if (record && typeof record === "object" && record.id) {
          foSubFrames.push({
            ...record,

            created_at:
              record.created_at === "0000-00-00"
                ? ""
                : commonHelper.formatDateWithSpash(record.created_at),

            photo: record.photo
              ? `${API_BASE_URL}/storage/uploads/images/photo/${record.photo}`
              : "",

            thumb: record.photo
              ? `${API_BASE_URL}/storage/uploads/images/photo/${record.photo}`
              : "",
          });
        }
      });

    });
  }

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foSubFrames,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};




