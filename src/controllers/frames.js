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


exports.addCustomFrames = async function (req, res) {
  try {
    /* Validate Request */
    const errors = validation.validate(req.body, "user_id_not_0,frame_name,image");
    if (errors.length > 0) {
      return validation.errorMessage(req, res, errors);
    }

    const extension = req.body.extestion || req.body.extension || "png";
    
    if (!req.body.image || !req.body.image.includes('base64')) {
      return res.send(securityHelper.ffp_send_response(req, {
        status: false,
        message: "Base64 image is required",
        data: [],
      }));
    }

    const storagePath = "storage/uploads/images/customframe/";
    const dbPath = "uploads/images/customframe/";

    // Upload base64 image
    const fsImageName = require('@/helper/upload-helper').getFileName(extension, req.body.user_id);
    const fullPath = config.FILE_UPLOAD_PATH + storagePath + fsImageName;
    
    await require('@/helper/upload-helper').uploadBase64Image(fullPath, req.body.image, extension);

    // Store in database
    const frameData = {
      user_id: req.body.user_id,
      frame_name: req.body.frame_name,
      image: dbPath + fsImageName,
      free_paid: req.body.free_paid || 1,
      status: req.body.status || 1,
      user_customize: 1,
      created_at:config.CURRENT_DATE(),
      updated_at:config.CURRENT_DATE(),
    };

    await frameModel.addCustomFrame(frameData);

    const responseJson = {
      status: true,
      message: "Custom frame added successfully!",
      data: { image: dbPath + fsImageName },
    };

    res.send(securityHelper.ffp_send_response(req, responseJson));
  } catch (error) {
    console.error("Error in addCustomFrames:", error);
    res.send(securityHelper.ffp_send_response(req, {
      status: false,
      message: error.message || "An error occurred",
      data: [],
    }));
  }
};