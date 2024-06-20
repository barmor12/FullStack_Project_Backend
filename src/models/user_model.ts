import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
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
    required: false,
  },
});

export default mongoose.model("User", userSchema);
