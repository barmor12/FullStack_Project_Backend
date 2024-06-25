import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  profilePic: {
    type: String,
    required: false,
  },
  refresh_tokens: {
    type: [String],
  },
  nickname: {
    type: String,
    required: true,
  },
});

export default mongoose.model("User", userSchema);
