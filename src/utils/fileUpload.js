const AWS = require("aws-sdk");
const fs = require("fs");
const mime = require("mime");

const spacesEndpoint = new AWS.Endpoint(process?.env?.AWS_END_POINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process?.env?.AWS_ACCESS_KEY_ID,
  secretAccessKey: process?.env?.AWS_SECRET_ACCESS_KEY,
});

// const getContentType = (filePath) => {
//   const contentType = mime.getType(filePath);
//   return contentType;
// };

function getContentTypeFromExtension(extension) {
  switch (extension.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    // Add more cases for other file extensions as needed
    default:
      return "application/octet-stream"; // Default content type
  }
}

function getFileExtensionFromBase64(base64String) {
  const base64Data = base64String.replace(/^data:[a-zA-Z\/]+;base64,/, "");

  const buffer = Buffer.from(base64Data, "base64");

  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return "jpg";
  } if (buffer[0] === 0x89 && buffer[1] === 0x50) {
    return "png";
  } if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return "gif";
  } if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
    return "bmp";
  }
  return null;
}

const uploadFileToSpace = async ({ keyPath, binaryData, extestion }) => {
  const Body = Buffer.from(binaryData, "base64");

  if (!extestion) {
    extestion = getFileExtensionFromBase64(binaryData);
  }

  const ContentType = getContentTypeFromExtension(extestion);

  const params = {
    Bucket: process?.env?.AWS_BUCKET_NAME,
    Key: keyPath,
    Body,
    ACL: "public-read",
    ContentType,
  };

  try {
    // const data = await s3.upload(params).promise();
    // console.log("File uploaded successfully:", data.Location);
  } catch (error) {
    console.error("Error uploading file:", error);
    return false;
  }

  return true;
};

module.exports = {
  uploadFileToSpace,
};
