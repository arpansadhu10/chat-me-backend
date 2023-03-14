import asyncHandler from 'express-async-handler';
// const Chat = require("../models/chat-model");
import Chat from '../models/chat-model.js';
// const Message = require("../models/message-model");
import Message from '../models/message-model.js';
// const User = require("../models/user-model");
import User from '../models/user-model.js';
// const jwt = require("jsonwebtoken");
import Jwt from 'jsonwebtoken';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = Jwt
        .verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded?.id).select("-password");
      if (user.isVerified === false) {

        if (user.notVerifiedReason === "EMAIL") {
          throw new APIError("Please Verify Your Email", 401);
        }
        if (user.notVerifiedReason === "OTP") {
          throw new APIError("Please Verify Your Phone Number", 401)
        }
        if (user.notVerifiedReason === "BANNED") {
          throw new APIError("User banned from platform. Please contact administrator", 401);
        }
        else {
          throw new APIError("Please contact administrator", 401);
        }
      }

      req.user = user
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token mismatch");
    }
  } else {
    res.status(401);
    throw new Error("Token not found");
  }
});

// export default protect;
