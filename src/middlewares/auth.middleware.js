import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
const verifyJwt = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).send("Unauthorized request");
    }
    console.log("Access_token derived from brower cookie", token);
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("token decoded", decodedToken);
    if (!decodedToken) {
      return res.status(401).send("Unauthorized request");
    }
    console.log("id=", decodedToken.id, "email=", decodedToken.email);
    const user = await User.findById(decodedToken.id);
    console.log("the logged in user", user);
    console.log("user is authorized");
    if (!user) {
      return res.status(401).send("Invalid access token");
    }
    //   added user to req which will be used in other function which used this middleware
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
  }
};

export { verifyJwt };
