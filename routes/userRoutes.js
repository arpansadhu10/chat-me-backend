// const express = require("express");
import Router from 'express'
import {
  registerUser,
  authUser,
  searchUser,
  verifyEmail,
  verifyOTP,
  loginViaOtp,
  updatePassword,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = Router();

userRouter.post("/", registerUser);

userRouter.get("/", protect, searchUser);

userRouter.post("/login", authUser)
userRouter.post("/verify-email", verifyEmail)
userRouter.post("/verify-otp", verifyOTP)
userRouter.post("/login/otp", loginViaOtp)
userRouter.post("/forgot=password", loginViaOtp)
userRouter.post("/update=password", protect, updatePassword)

export default userRouter;
