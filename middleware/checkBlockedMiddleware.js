import BlockedUsers from "../models/blockedUsers-model.js";
import Chat from "../models/chat-model.js";
import User from "../models/user-model.js";
import APIError from "../utils/APIError.js";

export const isBlocked = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const friendsChatId = req.body.chatId;
        // const isFriendPresent = await Chat.findById(friendsChatId);
        // if (!isFriendPresent) {
        //     throw new APIError("not found", 404);
        // }

        const isFriendAlreadyBlocked = await BlockedUsers.findOne({ user: userId });
        if (!isFriendAlreadyBlocked) {
            next();
        }
        const arr = isFriendAlreadyBlocked.blockedUsers;
        console.log(arr);
        arr.map((i) => {
            console.log(i, friendsChatId);
            if (String(i) === String(friendsChatId)) {
                req.blocked = true;
                next();
            }
        })
        next();
    } catch (err) {
        next(err);
    }
}