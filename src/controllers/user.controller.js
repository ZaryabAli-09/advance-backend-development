import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryConfig.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const test = (req, res) => {
  res.status(200).json({
    message: "Api is working!!",
  });
};
const registerUser = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;
    if (username == "" || email == "" || password == "" || fullName == "") {
      return res.status(400).send("All fields are required");
    }
    const IsUserAlreadyExist = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (IsUserAlreadyExist) {
      return res.status(409).send("User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
      return res.status(400).send("Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log(avatar, coverImage);
    if (!avatar) {
      return res.status(400).send("Error occur while uploading avatar");
    }

    const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET);
    console.log(accessToken + " ||" + refreshToken);

    const encrptedPassword = await bcryptjs.hashSync(password);
    console.log("ecrpt pass", encrptedPassword);
    const userData = new User({
      username: username.toLowerCase(),
      email,
      password: encrptedPassword,
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    });

    const savedUser = await userData.save();

    res.status(201).json(savedUser);

    // *******above code algorithm *********
    //get user details from frontend
    // validation - not empty
    // check if user is already exists
    // check for images ,check for avatar
    // if images/files available them upload them on cloudinary

    // token assigining
    // password encryption
    // create user object - save object in db
    // remove password and refresh token field from response
    // check for user creation
    // return res to frontend
  } catch (error) {
    console.log(error);
  }
};

export { test, registerUser };
