import mongoose from "mongoose";

interface Icomments extends Document {
  videoId: String;
  userId: String;
  comment: String;
  isSpoiler: Boolean;
}

const commentSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId,ref:"AnimeVideo", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId,ref:"User", required: true },
  comment: { type: String, required: true },
  isSpoiler: { type: Boolean, default: false },
});

const Comment = mongoose.model<Icomments>("Comment", commentSchema);
export default Comment;
