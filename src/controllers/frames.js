const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const validation = require("@/helper/validation");

const frameModel = require(`@/models/${config.api_version}/frames`);

exports.getFrames = async function (req, res) {
  const foUserFrames = [];
  let counter = 1;
  if (parseInt(req.body.user_id) > 0) {
    const foUserFramesList = await frameModel.getUserFrames(req.body.user_id);
    foUserFramesList?.forEach((foSingleElement) => {
      foSingleElement.image = foSingleElement.image !== "" ? `media/frames/custom/${foSingleElement.image}` : "";
      foSingleElement.id = "custom";
      foSingleElement.counter = counter;
      foUserFrames.push(foSingleElement);
      counter++;
    });
  }

  const foDefaultFrames = [];
  const foDefaultFrameLists = await frameModel.getDefaultFrames();

  foDefaultFrameLists?.forEach((foSingleElement) => {
    foSingleElement.image = foSingleElement.image !== "" ? `media/frames/${foSingleElement.image}` : "";
    foSingleElement.counter = counter;
    foDefaultFrames.push(foSingleElement);
    counter++;
  });

  const foAllFrames = foUserFrames.concat(foDefaultFrames);
  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foAllFrames,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};

exports.getSubFrames = async function (req, res) {
  /* Validate Request */
  const errors = validation.validate(req.body, "id");
  if (errors.length > 0) {
    return validation.errorMessage(req, res, errors);
  }

  const foSubFrames = [];
  if (parseInt(req.body.user_id) > 0) {
    const foSubFramesList = await frameModel.getSubFrames(req.body.id);

    foSubFramesList?.forEach((foSingleElement) => {
      foSingleElement.image = foSingleElement.image !== "" ? `media/frames/subframes/${foSingleElement.image}` : "";
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
