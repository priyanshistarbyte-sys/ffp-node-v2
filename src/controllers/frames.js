const config = require("@/config/config");
const securityHelper = require("@/helper/security");
const validation = require("@/helper/validation");

const frameModel = require(`@/models/${config.api_version}/frames`);
const { API_BASE_URL } = process.env;

exports.getFrames = async function (req, res) {
  const foUserFrames = [];
  let counter = 1;
  
  // Clean base URL once
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  
  if (parseInt(req.body.user_id) > 0) {
    const foUserFramesList = await frameModel.getUserFrames(req.body.user_id);
    
    foUserFramesList?.forEach((foSingleElement) => {
      if (Array.isArray(foSingleElement)) {
        // Handle array of frames
        foSingleElement.forEach((frame) => {
          if (frame && frame.frame_name) {
            const cleanImage = frame.image && frame.image !== "" ? frame.image.replace(/^\/+/, "") : "";
            frame.image = cleanImage ? `${baseUrl}/storage/${cleanImage}` : "";
            frame.id = "custom";
            frame.counter = counter;
            foUserFrames.push(frame);
            counter++;
          }
        });
      } else if (foSingleElement && foSingleElement.frame_name) {
        // Handle direct frame object
        const cleanImage = foSingleElement.image && foSingleElement.image !== "" ? foSingleElement.image.replace(/^\/+/, "") : "";
        foSingleElement.image = cleanImage ? `${baseUrl}/storage/${cleanImage}` : "";
        foSingleElement.id = "custom";
        foSingleElement.counter = counter;
        foUserFrames.push(foSingleElement);
        counter++;
      }
    });
  }

  const foDefaultFrames = [];
  const foDefaultFrameLists = await frameModel.getDefaultFrames();

  foDefaultFrameLists?.forEach((foSingleElement) => {
    if (Array.isArray(foSingleElement)) {
      // Handle array of frames
      foSingleElement.forEach((frame) => {
        if (frame && frame.frame_name) {
          const cleanImage = frame.image && frame.image !== "" ? frame.image.replace(/^\/+/, "") : "";
          frame.image = cleanImage ? `${baseUrl}/storage/${cleanImage}` : "";
          frame.counter = counter;
          foDefaultFrames.push(frame);
          counter++;
        }
      });
    } else if (foSingleElement && foSingleElement.frame_name) {
      // Handle direct frame object
      const cleanImage = foSingleElement.image && foSingleElement.image !== "" ? foSingleElement.image.replace(/^\/+/, "") : "";
      foSingleElement.image = cleanImage ? `${baseUrl}/storage/${cleanImage}` : "";
      foSingleElement.counter = counter;
      foDefaultFrames.push(foSingleElement);
      counter++;
    }
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

  // Clean base URL once
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  
  const foSubFrames = [];
  if (parseInt(req.body.user_id) > 0) {
    const foSubFramesList = await frameModel.getSubFrames(req.body.id);

    foSubFramesList?.forEach((foSingleElement) => {
      if (Array.isArray(foSingleElement)) {
        // Handle array of frames
        foSingleElement.forEach((frame) => {
          if (frame && frame.image !== undefined) {
            const cleanImage = frame.image && frame.image !== "" ? frame.image.replace(/^\/+/, "") : "";
            frame.image = cleanImage ? `${baseUrl}/storage/${cleanImage}` : "";
            foSubFrames.push(frame);
          }
        });
      } else if (foSingleElement && foSingleElement.image !== undefined) {
        // Handle direct frame object
        const cleanImage = foSingleElement.image && foSingleElement.image !== "" ? foSingleElement.image.replace(/^\/+/, "") : "";
        foSingleElement.image = cleanImage ? `${baseUrl}/storage/${cleanImage}` : "";
        foSubFrames.push(foSingleElement);
      }
    });
  }

  const responseJson = {
    status: true,
    message: "Result Successfully get!....",
    data: foSubFrames,
  };

  res.send(securityHelper.ffp_send_response(req, responseJson));
};
