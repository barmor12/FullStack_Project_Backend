import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true, // וודא שהשולח הוא חובה
  },
});

export default mongoose.model("Post", postSchema);
