// const express = require("express");
import Router from "express";
import multer from "multer";
import { blockUser } from "../controllers/blockUserController.js";
import {
  registerUser,
  authUser,
  searchUser,
  updateProfile,
  updateMutedChats
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRouter = Router();

userRouter.post("/", registerUser);

userRouter.get("/", protect, searchUser);

userRouter.post("/login", authUser);

userRouter.post("/update-user", protect, upload.single("image"), updateProfile);

userRouter.get('/:user/block', protect, blockUser);
userRouter.put("/mute-chat/:chatId", protect, updateMutedChats);

export default userRouter;
