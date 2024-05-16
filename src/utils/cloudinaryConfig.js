import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return console.log("could not find path");
    }
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded succesfully
    console.log("file is uploaded", res.url);
    return res;
  } catch (err) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporaray file as the upload operation got failed
    return;
  }
};

export { uploadOnCloudinary };
