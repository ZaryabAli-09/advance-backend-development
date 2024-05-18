import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
const verifyJwt = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).send("Unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      return res.status(401).send("Unauthorized request");
    }
    const user = await User.findById(decodedToken.id);
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
