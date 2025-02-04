import mongoose from "mongoose";

interface Icomments extends Document {
  videoId: String;
  userId: String;
  comment: String;
  isSpoiler: Boolean;
}

const commentSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  userId: { type: String, required: true },
  comment: { type: String, required: true },
  isSpoiler: { type: Boolean, required: true },
});

const Comment = mongoose.model<Icomments>("Comment", commentSchema);
export default Comment;
