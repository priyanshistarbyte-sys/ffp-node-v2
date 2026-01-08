const fs = require("fs");

const fileUpload = require("@/utils/fileUpload");

const fileStore = async (req, res) => {
  const keyPath = "test/test1234.png";
  const filePath = `${global.appRootPath}/media/Screenshot_2.png`;

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error("Error reading image:", err);
    } else {
      // Convert the image data to a base64-encoded string
      const binaryData = data.toString("base64");

      fileUpload.uploadFileToSpace({ keyPath, binaryData });

      // Display or use the base64-encoded image as needed
      console.log("Base64-encoded image:", binaryData);
    }
  });

  res.send({});
};

module.exports = {
  fileStore,
};
