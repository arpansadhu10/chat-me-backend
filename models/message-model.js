// const mongoose = require("mongoose");
import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const messageModel = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  },
  { timestamps: true }
);
messageModel.plugin(paginate);
const Message = mongoose.model("Message", messageModel);

export default Message;
