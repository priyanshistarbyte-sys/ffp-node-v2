const config = require("../config/config");
const commonHelper = require("./common-helper");
const fs = require("fs").promises;
const path = require("path");

exports.uploadBase64Image = async (base_path, base64_string, extestion, user_id = 0) => {
  let fileName = commonHelper.customFormatDate(new Date(), "YmdHis");
  if (user_id != 0) {
    fileName += user_id;
  }
  let base64ImageString = "";

  if (extestion == "png") {
    fileName += ".png";
    base64ImageString = Buffer.from(base64_string.replace("data:image/png;base64,", ""), "base64");
  } else if (extestion == "jpg" || extestion == "jpeg") {
    fileName += ".jpg";
    base64ImageString = Buffer.from(base64_string.replace("data:image/jpeg;base64,", ""), "base64");
  }

  const filePath = config.FILE_UPLOAD_PATH + base_path + fileName;

  await fs.writeFile(filePath, base64ImageString);

  return fileName;
};


exports.getFileName = (extestion, userId = 0) => {

  let fileName = commonHelper.customFormatDate(new Date(), "YmdHis");
  if (userId != 0) {
    fileName += userId;
  }

  if (extestion === "png") {
    fileName += ".png";
  
  } else if (extestion === "jpg" || extestion === "jpeg") {
    fileName += ".jpg";
  }

  return fileName;
}


/* exports.removeImage = async (basePath) => {
  const filePath = config.FILE_UPLOAD_PATH + basePath;
  await fs.unlink(filePath);
  return true;
}; */

exports.removeImage = async (basePath) => {
  try {
    const filePath = config.FILE_UPLOAD_PATH + basePath;
    try {
      await fs.access(filePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log(`File not found: ${filePath}`);
        return false; 
      }
      throw err;
    }
    await fs.unlink(filePath);
    console.log(`File removed: ${filePath}`);
    return true;

  } catch (err) {
    console.error(`Error removing file: ${err.message}`);
    return false; 
  }
};