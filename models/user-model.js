// const mongoose = require("mongoose");
import mongoose from "mongoose";
// const bcrypt = require("bcryptjs");
import bcrypt from 'bcryptjs'
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: { type: String },
  },
  {
    timestamps: true,
  }
);
userSchema.methods.matchPassword = async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword, this.password);
};

// async function matchPassword(enterdPassword) {
//   return await bcrypt.compare(enterdPassword, this.password);
// }

userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.method('toJSON', function toJSON() {
  const user = this.toObject();
  delete user.password;
  return user;
});
const User = mongoose.model("User", userSchema);

export default User;
// module.exports = {matchPassword}
