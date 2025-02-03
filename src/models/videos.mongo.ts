import mongoose, { Schema, Document } from "mongoose";
interface IVideo extends Document {
  EpisodeNo: Number;
  url: string;
  comments: String;
}

const videoScheme: Schema = new mongoose.Schema({
  EpisodeNo: { type: Number, required: true },
  url: { type: String, required: true },
  comments: { type: String },
});

const AnimeVideo = mongoose.model<IVideo>("AnimeVideo", videoScheme);

export default AnimeVideo;
