// const express = require("express");
import express from 'express'
import {
  sendMessage,
  allMessages,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isBlocked } from '../middleware/checkBlockedMiddleware.js';

const messageRouter = express.Router();

messageRouter.post("/", protect, isBlocked, sendMessage)
messageRouter.get("/:chatId",
  protect,
  allMessages)

export default messageRouter;
