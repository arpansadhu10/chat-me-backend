import asyncHandler from 'express-async-handler';
// const Chat = require("../models/chat-model");
import Chat from '../models/chat-model.js';
// const Message = require("../models/message-model");
import Message from '../models/message-model.js';
// const User = require("../models/user-model");
import User from '../models/user-model.js';
// const jwt = require("jsonwebtoken");
import Jwt from 'jsonwebtoken';
import APIError from '../utils/APIError.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(token);
      const decoded = Jwt
        .verify(token, process.env.JWT_SECRET);
      console.log(decoded, "decoded");
      req.user = await User.findById(decoded?.id).select("-password");
      next();
    } catch (error) {
      throw new APIError("Not authorized, token mismatch", 401);
    }
  } else {
    throw new APIError("Token not found", 401);
  }
});

// export default protect;
