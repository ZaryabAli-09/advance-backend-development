import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import { uploadFileUsingMulter } from "../middlewares/multer.middleware.js";

const router = Router();

router.post(
  "/register",
  uploadFileUsingMulter.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.post("/login", loginUser);

export default router;
