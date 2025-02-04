import mongoose from "mongoose";

interface Icomments extends Document {
  videoId: String;
  userId: String;
  comment: String;
  isSpoiler: Boolean;
}

const commentSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  comment: { type: String, required: true },
  isSpoiler: { type: Boolean, default: false },
});

const Comment = mongoose.model<Icomments>("Comment", commentSchema);
export default Comment;
