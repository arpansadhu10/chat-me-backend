import generateToken from "../config/generateToken";
import User from "../models/user-model"
import APIError from "../utils/APIError";
import { generateEmailVerificationToken, generateRedirectionUrl } from "../utils/helpers";

export const updatePasswordService = async (id, password) => {
    const user = await User.exists({ _id: id });
    if (!user) {
        throw new APIError("User not found", 404);
    }
    const newUser = await User.findByIdAndUpdate(id, { password: password }, { new: true });
    return newUser;
}


export const forgotPasswordService = async (email) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new APIError("User not found", 404);
    }
    const emailHash = generateEmailVerificationToken();
    const id = user._id;
    user.emailVerificationHash = emailHash;
    await user.save();

    const redirectionUrl = generateRedirectionUrl(emailVerificationHash);

    //TODO: send email
    console.log(redirectionUrl);
    return;
}


export const verifyEmail = async (emailHash) => {
    const user = await User.findOne({ emailVerificationHash: emailHash });

    if (!user) throw new APIError('Invalid verification token', httpStatus.NOT_FOUND);

    user.emailVerificationHash = undefined;
    await user.save();

    const token = generateToken(user._id.toString());

    return { user, token };
}