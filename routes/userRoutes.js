// const express = require("express");
import Router from "express";
import multer from "multer";
import {
  registerUser,
  authUser,
  searchUser,
  updateProfile
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRouter = Router();

userRouter.post("/", registerUser);

userRouter.get("/", protect, searchUser);

userRouter.post("/login", authUser);

userRouter.post("/update-user", protect, upload.single("image"), updateProfile);

export default userRouter;
 