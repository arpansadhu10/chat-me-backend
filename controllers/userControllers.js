// const asyncHandler = require("express-async-handler");
import asyncHandler from 'express-async-handler';
// const User = require("../models/user-model");
import User from '../models/user-model.js';
import generateToken from "../config/generateToken.js";
import APIError from '../utils/APIError.js';
import httpStatus from 'http-status';
import { comparePasswordHash, generateEmailVerificationToken, generateEmailVerifyUrl, generateOTP, generatePasswordHash } from '../utils/helpers.js';
import EmailService from '../utils/emailService.js';

// POST api/user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic, contactNumber } = req.body;
  if (!name || !password) {
    // res.status(400);
    throw new APIError("Please enter all fields", 401);
  }
  if (!email && !(contactNumber)) {
    throw new APIError("Please enter all fields", 401);
  }


  let userExistsViaEmail = []
  if (email !== undefined) {
    console.log(email, "EMAIL");
    userExistsViaEmail = await User.aggregate([
      {
        '$match': {
          'email': 'test@gmail.com'
        }
      }
    ]);

  }
  let userExistsViaContactNumber = [];
  if (contactNumber !== undefined) {
    if (contactNumber.number !== undefined) {
      userExistsViaContactNumber = await User.aggregate([
        {
          '$match': {
            '$and': [
              {
                'contactNumber.number': String(contactNumber.number)
              }, {
                'contactNumber.countryCode': String(contactNumber.countryCode)
              }
            ]
          }
        }
      ]);
    }
  }

  console.log(userExistsViaEmail, userExistsViaContactNumber);

  if (userExistsViaEmail.length > 0 || userExistsViaContactNumber.length > 0) {
    // res.status(400);
    throw new APIError("User already exists", 400);
  }
  const emailHash = generateEmailVerificationToken();
  const emailHashEncrypted = await generatePasswordHash(String(emailHash));
  const OTP = generateOTP();
  const otpHash = await generatePasswordHash(String(OTP))
  console.log(OTP, emailHash);
  let user;
  if (email && !contactNumber) {
    user = await User.create({
      signInMethod: 'EMAIL',
      name,
      email,
      password,
      pic: pic || "somepic",
      emailVerificationHash: emailHashEncrypted
    });
    const url = generateEmailVerifyUrl(emailHash, email);
    //TODO:SEND MAIL

    await EmailService.sendMail({
      from: `ChatApp <${String(process.env.AWS_SES_EMAIL)}>`,
      to: user.email,
      text: 'Email Verification',
      subject: 'Chatapp | Email Verification',
      html: `<div>
              <p>Hi ${user.name}.</p>
              <p>This Email contains your link to verify email id</p>
              <p>Please click here</p>
              <a>${url}</a>
            </div>`,
    });

  } else if (contactNumber && !email) {
    user = await User.create({
      signInMethod: 'OTP',
      name,
      contactNumber,
      password,
      pic: pic || "somepic",
      otpToken: otpHash
    });
  } else {
    user = await User.create({
      signInMethod: 'BOTH GIVEN',
      name,
      email,
      contactNumber,
      password,
      pic: pic || 'somepic',
      emailVerificationHash: emailHash,
      otpToken: otpHash
    });
  }

  console.log(user);
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber,
      pic: pic || "somepic",
    });
  } else {
    // res.status(400);
    throw new Error("Failed to create new user", 400);
  }
});

// POST api/user/login
const authUser = asyncHandler(async (req, res) => {

  const { email, password } = req.body;
  if (!email || !password) {
    throw new APIError("Enter all the fields", 401);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new APIError("User not found", 404);
  }
  console.log(user);
  // if (!user.isVerified) {
  //   throw new APIError("User not verified", 400);

  // }
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
  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: pic || "somepic",
      token: generateToken(user._id),
    });
  } else {
    // res.status(400);
    throw new APIError("Failed to login user", 400);
  }
});


//POST api/user/login/otp
export const loginViaOtp = async (req, res, next) => {
  try {
    const { contactNumber } = req.body;


    let userExistsViaContactNumber = [];
    if (contactNumber !== undefined) {
      if (contactNumber.number !== undefined) {
        userExistsViaContactNumber = await User.aggregate([
          {
            '$match': {
              '$and': [
                {
                  'contactNumber.number': String(contactNumber.number)
                }, {
                  'contactNumber.countryCode': String(contactNumber.countryCode)
                }
              ]
            }
          }
        ]);
        if (userExistsViaContactNumber.length > 0) {
          // res.status(400);
          const OTP = generateOTP();
          console.log(OTP);
          const otpHash = await generatePasswordHash(String(OTP));
          const user = await User.findById(userExistsViaContactNumber[0]._id);
          user.otpToken = otpHash;
          user.save();
          res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            contactNumber: user.contactNumber,
            pic: user.pic || "somepic",
          });
        } else {
          throw new APIError("User not found", 400);
        }
      } else {
        throw new APIError("Invalid fields", 404);

      }
    } else {
      throw new APIError("Invalid fields", 404);

    }
  } catch (err) {
    next(err);
  }
}


// POST api/user/verify-email
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, hash } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new APIError("User not found", 404);
    }
    if (user.emailVerificationHash === undefined) {
      throw new APIError("Invalid Request", 404);

    }
    // console.log(await comparePasswordHash(user.emailVerificationHash, String(hash)));
    console.log(user);
    if (await comparePasswordHash(String(hash), String(user.emailVerificationHash))) {
      console.log("here");
      user.emailVerificationHash = undefined;
      user.otpToken = undefined;
      user.isVerified = true;
      // await user.save();

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        pic: user.pic || "somepic",
        token: generateToken(user._id),
      });
    } else {
      throw new APIError("Invalid Request", 404);

    }
  } catch (err) {
    console.log(err);
    next(err)
  }
}

// POST api/user/verify-otp
export const verifyOTP = async (req, res, next) => {
  try {
    const { contactNumber, OTP } = req.body;
    const user = await User.aggregate([
      {
        '$match': {
          '$and': [
            {
              'contactNumber.number': String(contactNumber.number)
            }, {
              'contactNumber.countryCode': String(contactNumber.countryCode)
            }
          ]
        }
      }
    ]);
    if (!user[0]) {
      throw new APIError("User not found", 404);
    }
    console.log(user, user[0].otpToken);
    console.log(await comparePasswordHash(String(OTP), user[0].otpToken));
    if (await comparePasswordHash(String(OTP), user[0].otpToken)) {
      user[0].emailVerificationHash = undefined;
      user[0].otpToken = undefined;
      user[0].isVerified = true;

      // const result = await User.aggregate([
      //   {
      //     '$match': {
      //       '$and': [
      //         {
      //           'contactNumber.number': String(contactNumber.number)
      //         }, {
      //           'contactNumber.countryCode': String(contactNumber.countryCode)
      //         }
      //       ]
      //     }
      //   }, {
      //     '$set': { isVerified: true }
      //   }, {
      //     $project: { emailVerificationHash: 0, otpToken: 0 }
      //   }]);
      const result = await User.findById(user[0]._id)
      result.emailVerificationHash = undefined;
      result.otpToken = undefined;
      result.isVerified = true;
      result.save();

      console.log(result);
      res.status(201).json({
        result,
        token: generateToken(user[0]._id),
      });
    } else {
      throw new APIError("Invalid Request", 402);
    }
  } catch (err) {
    next(err)
  }
}

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
