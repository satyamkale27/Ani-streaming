import mongoose, { Schema, Document } from "mongoose";
interface IVideo extends Document {
  EpisodeNo: Number;
  url: string;
  comments: mongoose.Schema.Types.ObjectId[];
}

const videoScheme: Schema = new mongoose.Schema({
  EpisodeNo: { type: Number, required: true },
  url: { type: String, required: true },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true },
  ],
});

const AnimeVideo = mongoose.model<IVideo>("AnimeVideo", videoScheme);

export default AnimeVideo;
