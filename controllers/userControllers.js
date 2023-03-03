// const asyncHandler = require("express-async-handler");
import asyncHandler from 'express-async-handler';
// const User = require("../models/user-model");
import User from '../models/user-model.js';
import generateToken from "../config/generateToken.js";
import APIError from '../utils/APIError.js';
import httpStatus from 'http-status';

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    // res.status(400);
    throw new APIError("Please enter all feilds", 401);
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    // res.status(400);
    throw new APIError("User already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      pic: user.pic || "somepic",
      token: generateToken(user._id),
    });
  } else {
    // res.status(400);
    throw new APIError("Failed to create new user", 400);
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    // res.status(401);
    throw new APIError("Enter all the feilds", 401);
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      pic: user.pic || "somepic",
      token: generateToken(user._id),
    });
  } else {
    // res.status(400);
    throw new APIError("Failed to login user", 400);
  }
});

// api/user?search=something
const searchUser = asyncHandler(async (req, res) => {
  const searchString = req.query.search;
  const keyword = searchString
    ? {
      $or: [
        { name: { $regex: searchString, $options: "i" } },
        { email: { $regex: searchString, $options: "i" } },
      ],
    }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

export { registerUser, authUser, searchUser };
