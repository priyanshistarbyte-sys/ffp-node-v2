const config = require("../config/config");
const commonHelper = require("./common-helper");
const fs = require("fs").promises;
const path = require("path");

exports.uploadBase64Image = async (base_path, base64_string, extestion, user_id = 0) => {
  let fileName = commonHelper.customFormatDate(new Date(), "YmdHis");
  if (user_id != 0) {
    fileName += user_id;
  }

  // Remove data URI prefix if present
  let base64Data = base64_string;
  if (base64Data.includes('base64,')) {
    base64Data = base64Data.split('base64,')[1];
  }

  // Add extension
  const ext = extestion.toLowerCase();
  if (ext === "png") {
    fileName += ".png";
  } else if (ext === "jpg" || ext === "jpeg") {
    fileName += ".jpg";
  } else {
    fileName += `.${ext}`;
  }

  const base64ImageString = Buffer.from(base64Data, "base64");
  const filePath = base_path;
  const dirPath = path.dirname(filePath);

  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, base64ImageString);

  return fileName;
};



exports.getFileName = (extestion, userId = 0) => {
  let fileName = commonHelper.customFormatDate(new Date(), "YmdHis");
  if (userId != 0) {
    fileName += userId;
  }

  // Normalize extension
  const ext = extestion.toLowerCase();
  
  if (ext === "png") {
    fileName += ".png";
  } else if (ext === "jpg" || ext === "jpeg") {
    fileName += ".jpg";
  } else {
    fileName += `.${ext}`;
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