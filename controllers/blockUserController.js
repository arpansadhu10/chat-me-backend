import BlockedUsers from "../models/blockedUsers-model.js";
import User from "../models/user-model.js";
import APIError from "../utils/APIError.js";

export const blockUser = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const toBlock = req.params.user;
        console.log(userId);
        if (userId === toBlock) {
            throw new APIError("Error", 400);
        }
        //if already present
        const blockedUserList = await BlockedUsers.findOne({ user: userId });
        if (blockedUserList) {
            blockedUserList.blockedUser.push(toBlock);
            blockedUserList.save();
            return res.status(200).json("User Blocked");
        }
        const arr = new Array(toBlock);
        console.log(arr);
        const newBlockedUser = await BlockedUsers.create({
            user: userId,
            blockedUsers: [toBlock],
        });
        return res.status(200).json({ newBlockedUser });
    } catch (err) {
        next(err);
    }
}