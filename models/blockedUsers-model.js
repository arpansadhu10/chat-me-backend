// const mongoose = require("mongoose");
import mongoose from "mongoose";
const blockedChatSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        blockedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true }]
    },
    {
        timestamps: true,
    }
);

const BlockedChats = mongoose.model("blockedChats", blockedChatSchema);

export default BlockedChats;
