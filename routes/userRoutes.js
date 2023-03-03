// const express = require("express");
import Router from 'express'
import {
  registerUser,
  authUser,
  searchUser,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = Router();

userRouter.post("/", registerUser);

userRouter.get("/", protect, searchUser);

userRouter.post("/login", authUser)

export default userRouter;
