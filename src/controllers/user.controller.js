import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryConfig.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// generating access and refresh token functions
const refreshTokenGenerator = (email) => {
  const refreshTokenGenerator = jwt.sign(
    { email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
  return refreshTokenGenerator;
};
const accessTokenGenerator = (id, email) => {
  const accessTokenGenerator = jwt.sign(
    { id, email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
  return accessTokenGenerator;
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
    if (!avatar) {
      return res.status(400).send("Error occur while uploading avatar");
    }

    const refreshToken = refreshTokenGenerator(email);

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

    const refreshToken = refreshTokenGenerator(email);
    const accessToken = accessTokenGenerator(validUser._id, email);
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

    //errors and needs to understand
    // when send body in form data not working and in raw json its working -----not yet learned
    // tokens generation in seperate function --done
    // access token and refresh token working
    // cors credentials and token options
    // url encoded and express static
    // error handler function
    // register and login api module testing and resgistration time calculation
  } catch (error) {
    console.log(error);
  }
};
const logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("access_token", options)
    .clearCookie("refresh_token", options)
    .send("User logged out");
};

const refreshAccessToken = (req, res) => {
  try {
    const incommingRefreshToken = req.cookies.refresh_token;
    if (!incommingRefreshToken) {
      return res
        .status(401)
        .send("User is not registered || Unautuorized request");
    }

    const decodedToken = jwt.sign(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = User.findOne(decodedToken.id);
    if (!user) {
      return res.status(401).send("Unauthorized request");
    }
    if (incommingRefreshToken !== user.refreshToken) {
      return res.status(401).send("Refresh token expire");
    }
    const options = {
      secure: true,
      httpOnly: true,
    };
    const refreshToken = refreshTokenGenerator(email);
    const accessToken = accessTokenGenerator(validUser._id, email);

    return res
      .status(200)
      .cookie("access_token", accessToken, options)
      .cookie("refresh_token", refreshToken, options)
      .json({
        message: "User can continue in session",
        userData: user,
        tokens: { refreshToken, accessToken },
      });
  } catch (error) {
    console.log(error);
  }
};

export { registerUser, loginUser, logoutUser, refreshAccessToken };
