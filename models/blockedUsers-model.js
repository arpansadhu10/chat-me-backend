// const mongoose = require("mongoose");
import mongoose from "mongoose";
const blockedUserSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        blockedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true }]
    },
    {
        timestamps: true,
    }
);

const BlockedUsers = mongoose.model("blockedUsers", blockedUserSchema);

export default BlockedUsers;
