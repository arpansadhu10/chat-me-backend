// const express = require("express");
import express from 'express'
import {
  sendMessage,
  allMessages,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const messageRouter = express.Router();

messageRouter.post("/", protect, sendMessage)
messageRouter.get("/:chatId", protect, allMessages)

export default messageRouter;
