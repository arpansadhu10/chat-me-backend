// const asyncHandler = require("express-async-handler");
import asyncHandler from "express-async-handler";
// const User = require("../models/user-model");
import User from "../models/user-model.js";
import generateToken from "../config/generateToken.js";
import APIError from "../utils/APIError.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import httpStatus from "http-status";
import "dotenv/config";
import crypto from "crypto";

const awsBucketname = process.env.AWS_USER_BUCKET_NAME;
const awsBucketRegion = process.env.AWS_USER_BUCKET_REGION;
const awsBucketAccessKey = process.env.AWS_USER_BUCKET_ACCESS_KEY;
const awsBucketSecret = process.env.AWS_USER_BUCKET_SECRET;

const s3 = new S3Client({
  credentials: {
    accessKeyId: awsBucketAccessKey,
    secretAccessKey: awsBucketSecret
  },
  region: awsBucketRegion
});

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
    pic
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      pic: user.pic,
      token: generateToken(user._id)
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
      pic: user.pic,
      token: generateToken(user._id)
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
          { email: { $regex: searchString, $options: "i" } }
        ]
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

// api/user?search=something
const updateProfile = asyncHandler(async (req, res) => {
  // const { image, name } = req.body;
  console.log("body", req.body);
  console.log("file", req.file);
  try {
    const name = req.body.name;
    if (name.length == 0) {
      res.status(401).send("Name too small");
    }
    if (req.file) {
      const imageName = crypto.randomBytes(32).toString("hex");

      const params = {
        Bucket: awsBucketname,
        Key: imageName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };
      const command = new PutObjectCommand(params);

      await s3.send(command);

      const url = `https://${awsBucketname}.s3.${awsBucketRegion}.amazonaws.com/${imageName}`;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name: name, pic: url },
        { new: true }
      );
      res.send(user);
    } else {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name: name },
        { new: true }
      );
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        pic: user.pic,
        token: generateToken(user._id)
      });
    }
  } catch (e) {
    res.status(401).send(e);
  }
});

export { registerUser, authUser, searchUser, updateProfile };
