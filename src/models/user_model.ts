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
    required: false, // לא חובה, יכול להיות ריק
  },
  refresh_tokens: {
    type: [String],
  },
  name: {
    type: String,
    required: false, // לא חובה, יכול להיות ריק
  },
});

export default mongoose.model("User", userSchema);
