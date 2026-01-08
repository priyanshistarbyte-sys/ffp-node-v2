const db = require("@/config/database");
const config = require("@/config/config");
const queryHelper = require("@/helper/query-helper");
const uploadHelper = require("@/helper/upload-helper");
const commonHelper = require("@/helper/common-helper");
const paymentModel = require("./authentication");
const fileUpload = require("@/utils/fileUpload");

exports.updateProfile = async (requestBody) => {
  const where = { id: requestBody.user_id };
  const updateData = { updated_date: config.CURRENT_DATE() };

  if (requestBody.business_name !== undefined) {
    updateData.business_name = requestBody.business_name.replace(/"|'/g, "");
  }
  if (requestBody.name !== undefined) {
    updateData.name = requestBody.name.replace(/"|'/g, "");
  }
  if (requestBody.b_mobile !== undefined) {
    updateData.b_mobile2 = requestBody.b_mobile;
  }
  if (requestBody.b_email !== undefined) {
    updateData.b_email = requestBody.b_email;
  }
  if (requestBody.b_website !== undefined) {
    updateData.b_website = requestBody.b_website;
  }
  if (requestBody.address !== undefined) {
    updateData.address = requestBody.address.replace(/"|'/g, "");
  }

  if (requestBody.city !== undefined) {
    updateData.city = requestBody.city;
  }
  if (requestBody.state !== undefined) {
    updateData.state = requestBody.state;
  }
  if (requestBody.pincode !== undefined) {
    updateData.pincode = requestBody.pincode;
  }
  if (requestBody.lang !== undefined) {
    updateData.lang = requestBody.lang;
  }
  if (requestBody.gst_firm_name !== undefined) {
    updateData.gst_firm_name = requestBody.gst_firm_name.replace(/"|'/g, "");
  }
  if (requestBody.gst_no !== undefined) {
    updateData.gst_no = requestBody.gst_no;
  }
  if (requestBody.owner_name !== undefined) {
    updateData.owner_name = requestBody.owner_name.replace(/"|'/g, "");
  }
  if (requestBody.owner_birth_date !== undefined) {
    updateData.owner_birth_date = requestBody.owner_birth_date;
  }
  console.log("Sandip------------------------------",requestBody.owner_birth_date);
  if (requestBody.business_anniversary_date !== undefined) {
    updateData.business_anniversary_date = requestBody.business_anniversary_date;
  }
  if (requestBody.business_category_id !== undefined) {
    updateData.business_category_id = requestBody.business_category_id;
  }

  if (requestBody.extestion !== undefined && requestBody.image !== undefined && requestBody.extestion !== "" && requestBody.image !== "") {
    const logoname = await db.query(queryHelper.select("photo", "admin", { id: requestBody.user_id }));
    if (logoname[0].photo !== "") {
      const removePath = `media/logo/${logoname[0].photo}`;
      uploadHelper.removeImage(removePath);
    }

    const imagePath = "media/logo/";
    const fileName = uploadHelper.getFileName(requestBody.extestion);
    await uploadHelper.uploadBase64Image("media/logo/", requestBody.image, requestBody.extestion);

    const fileUploadRes = await fileUpload.uploadFileToSpace({
      binaryData: requestBody.image,
      keyPath: `${imagePath}${fileName}`,
      extestion: requestBody.extestion,
    });

    if (fileUploadRes) {
    }
    updateData.photo = fileName;
  }

  await db.query(
    queryHelper.update("admin", updateData, where),
  );
  return true;
};

exports.getUserProfile = async (userId) => {
  const where = { id: userId, role: "User" };
  let foUser = await db.query(
    queryHelper.select(
      "id,name,business_name,photo,mobile,email,b_email,b_mobile2,b_website,ispaid,expdate,planStatus,gender,address,status,note,last_login,created_at,updated_at,gst_firm_name,gst_no,owner_name,owner_birth_date,business_anniversary_date,business_category_id",
      "admin",
      where,
      "",
      1,
    ),
  );
  
  // Handle MySQL2 result format
  const users = Array.isArray(foUser[0]) ? foUser[0] : foUser;
  if (users.length > 0) {
    foUser = users[0];

    foUser.last_login = foUser.last_login != "0000-00-00 00:00:00" ? commonHelper.customFormatDate(foUser.last_login, "d/m/Y H:i") : "";
    foUser.gst_firm_name = foUser.gst_firm_name != null ? foUser.gst_firm_name: "";
    foUser.gst_no = foUser.gst_no != null ? foUser.gst_no: "";
    foUser.owner_name = foUser.owner_name != null ? foUser.owner_name: "";
    foUser.created_at = commonHelper.customFormatDate(foUser.created_at, "d/m/Y H:i");
    foUser.updated_at = commonHelper.customFormatDate(foUser.updated_at, "d/m/Y H:i");
    foUser.gender = foUser.gender == 0 ? "Male" : "Female";
    foUser.photo_name2 = `media/logo/${foUser.photo}`;
    foUser.photo_name = foUser.photo;
    foUser.photo = foUser.photo != "" ? foUser.photo : "uploadlogo.jpg";
    foUser.payments = await paymentModel.getPaymentData(foUser.id);
    foUser.token = "";
  }

  return foUser;
};

exports.getUserPosts = async (userId) => {
  const where = { user_id: userId };
  const foPostsLists = await db.query(
    queryHelper.select("post,created_at", "makepost", where, "post_id desc"),
  );
  const foPosts = [];
  if (foPostsLists.length > 0) {
    foPostsLists.forEach((foSingleElement) => {
      foSingleElement.created_at = foSingleElement.created_at != "0000-00-00" ? commonHelper.customFormatDate(foSingleElement.created_at, "d, F Y") : "";
      foSingleElement.post = `media/upload/${foSingleElement.post}`;
      foPosts.push(foSingleElement);
    });
  }

  return foPosts;
};

exports.uploadLogo = async (requestBody) => {
  const where = { id: requestBody.user_id };
  const updateData = { updated_date: config.CURRENT_DATE() };

  const logoname = await db.query(queryHelper.select("photo", "admin", { id: requestBody.user_id }));
  if (logoname[0].photo != "") {
    const removePath = `media/logo/${logoname[0].photo}`;
    uploadHelper.removeImage(removePath);
  }

  await uploadHelper.uploadBase64Image("media/logo/", requestBody.image, requestBody.extestion);

  const imagePath = "media/logo/";
  const fileName = uploadHelper.getFileName(requestBody.extestion);

  const fileUploadRes = await fileUpload.uploadFileToSpace({
    binaryData: requestBody.image,
    keyPath: `${imagePath}${fileName}`,
    extestion: requestBody.extestion,
  });

  if (fileUploadRes) {
  }
  updateData.photo = fileName;

  await db.query(
    queryHelper.update("admin", updateData, where),
  );
  return `media/logo/${updateData.photo}`;
};
