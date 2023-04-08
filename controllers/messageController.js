// const asyncHandler = require("express-async-handler");
import asyncHandler from 'express-async-handler';
// const Chat = require("../models/chat-model");
import Chat from '../models/chat-model.js';
// const Message = require("../models/message-model");
import Message from '../models/message-model.js';
// const User = require("../models/user-model");
import User from '../models/user-model.js';
import APIError from '../utils/APIError.js';
import mongoose from 'mongoose';

const sendMessage = async (req, res, next) => {
  // console.log("here");
  try {
    console.log(req.blocked);
    if (req.blocked == true) {
      console.log("userBlocked");
      throw new APIError("user Blocked", 400);
      // next();
    }
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res.status(401).send("Invalid params provided");
    }
    let newMessage = {
      content,
      chat: chatId,
      sender: req.user._id,
    };


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
    next(err)
  }
};

const allMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10
    const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1
    const skip = limit * (page - 1);
    if (!chatId) {
      throw new Error("Chat id not provided");
    }

    // const messages = await Message.find({ chat: chatId })
    //   .populate("sender", "name email pic")
    //   .populate("chat");


    const objectId = mongoose.Types.ObjectId(chatId);
    const pipeline = [
      {
        $match: {
          'chat': objectId
        }
      },
      {
        $lookup: {
          'from': 'users',
          'localField': 'sender',
          'foreignField': '_id',
          'as': 'sender'
        }
      }, {
        $unwind: {
          'path': '$sender',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        $project: {
          'sender.email': 0,
          'sender.password': 0,
          'sender.isVerified': 0,
          'sender.signInMethod': 0,
          'sender.createdAt': 0,
          'sender.updatedAt': 0,
          'sender.__v': 0
        }
      }, {
        $lookup: {
          'from': 'chats',
          'localField': 'chat',
          'foreignField': '_id',
          'as': 'chat'
        }
      }, {
        $unwind: {
          'path': '$chat',
          'preserveNullAndEmptyArrays': true
        }
      }
    ]

    const paginationStage1 = {
      $facet: {
        total: [
          {
            $count: 'createdAt',
          },
        ],
        data: [
          {
            $addFields: {
              _id: '$_id',
            },
          },
        ],
      },
    };
    const paginationStage2 = {
      $unwind: '$total',
    };
    const paginationStage3 = {
      $project: {
        messages: {
          $slice: ['$data', skip, limit],
        },
        pagination: {
          totalDocs: '$total.createdAt',
          hasPrevPage: {
            $gt: [skip / limit, 0],
          },
          hasNextPage: {
            $gt: [
              {
                $ceil: {
                  $divide: ['$total.createdAt', limit],
                },
              },
              {
                $add: [skip / limit, 1],
              },
            ],
          },
          prevPage: {
            $cond: {
              if: {
                $gt: [skip / limit, 0],
              },
              then: skip / limit,
              else: null,
            },
          },
          nextPage: {
            $cond: {
              if: {
                $gt: [
                  {
                    $ceil: {
                      $divide: ['$total.createdAt', limit],
                    },
                  },
                  {
                    $add: [skip / limit, 1],
                  },
                ],
              },
              then: {
                $add: [skip / limit, 2],
              },
              else: null,
            },
          },
          limit: {
            $literal: limit,
          },
          pagingCounter: {
            $add: [skip / limit, 1],
          },
          totalPages: {
            $ceil: {
              $divide: ['$total.createdAt', limit],
            },
          },
        },
      },
    };

    pipeline.push(paginationStage1, paginationStage2, paginationStage3)
    console.log(pipeline);
    const messages = await Message.aggregate(pipeline);
    console.log(messages);

    if (messages[0]) {
      return res.status(200).json(messages[0]);
    }

    res.status(200).json({
      students: [],
      pagination: {
        totalDocs: 0,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
        limit: limit,
        pagingCounter: page,
        totalPages: 1,
      },
    });
    // res.status(200).json(messages[0]);
  } catch (err) {
    next(err)
  }
};

export { sendMessage, allMessages };
