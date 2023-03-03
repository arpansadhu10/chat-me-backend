// const express = require("express");
import express from "express"
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removFromGroup,
  addToGroup,
  deleteChat,
  readBy,
} from "../controllers/chatControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const chatRouter = express.Router();

chatRouter.get("/", protect, fetchChats)
chatRouter.post("/", protect, accessChat)
chatRouter.put("/readby", protect, readBy)
chatRouter.delete("/delete", protect, deleteChat)
chatRouter.post("/group", protect, createGroupChat)
chatRouter.put("/rename", protect, renameGroup)
chatRouter.put("/group-remove", protect, removFromGroup)
chatRouter.put("/group-add", protect, addToGroup)

export default chatRouter;
