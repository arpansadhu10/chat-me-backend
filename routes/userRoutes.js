// const express = require("express");
import Router from 'express'
import {
  registerUser,
  authUser,
  searchUser,
  verifyEmail,
  verifyOTP,
  loginViaOtp,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = Router();

userRouter.post("/", registerUser);

userRouter.get("/", protect, searchUser);

userRouter.post("/login", authUser)
userRouter.post("/verify-email", verifyEmail)
userRouter.post("/verify-otp", verifyOTP)
userRouter.post("/login/otp", loginViaOtp)

export default userRouter;
