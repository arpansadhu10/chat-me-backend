// const asyncHandler = require("express-async-handler");
import asyncHandler from 'express-async-handler';
// const Chat = require("../models/chat-model");
import Chat from '../models/chat-model.js';
// const Message = require("../models/message-model");
import Message from '../models/message-model.js';
// const User = require("../models/user-model");
import User from '../models/user-model.js';

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content) {
    return res.status(401).send("Invalid params provided");
  }
  let newMessage = {
    content,
    chat: chatId,
    sender: req.user._id,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic email");
    message = await message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (err) {
    res.status(401);
    throw new Error(err.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    throw new Error("Chat id not provided");
  }

  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email pic")
      .populate("chat");
    res.status(200).json(messages);
  } catch (err) {
    res.status(401);
    throw new Error(err.message);
  }
});

export { sendMessage, allMessages };
