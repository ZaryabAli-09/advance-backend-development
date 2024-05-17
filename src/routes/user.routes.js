import { Router } from "express";
import { registerUser, test } from "../controllers/user.controller.js";
import { uploadFileUsingMulter } from "../middlewares/multer.middleware.js";

const router = Router();
router.get("/test", test);
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

export default router;
