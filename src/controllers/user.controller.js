import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryConfig.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

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
    if (!avatar) {
      return res.status(400).send("Error occur while uploading avatar");
    }

    const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET);

    const encrptedPassword = bcryptjs.hashSync(password, 10);

    const userData = new User({
      username: username.toLowerCase(),
      email,
      password: encrptedPassword,
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      refreshToken,
    });

    const savedUser = await userData.save();
    savedUser.password = undefined;
    savedUser.refreshToken = undefined;
    res.status(201).json({
      message: "User successfully registered",
      userData: savedUser,
    });

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

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email == "" || password == "") {
      return res.status(400).send("All fields are required");
    }
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return res.status(404).send("User not found");
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET);
    validUser.refreshToken = undefined;
    validUser.password = undefined;
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("access_token", accessToken, options)
      .cookie("refresh_token", refreshToken, options)
      .json({
        message: "User logged in successfully",
        userData: validUser,
        tokens: { refreshToken, accessToken },
      });

    // get user details from body
    // check if user is valid --is user registered in db
    // if user is registered check if password is correct or not
    //generate and give access_token to the user
    // set token in cookie of browser
    // if user is successfully logged in check if cookie token===token we provided
    // remove password and refresh token fields from response
    // return the user details in response
  } catch (error) {
    console.log(error);
  }
};

export { registerUser, loginUser };
