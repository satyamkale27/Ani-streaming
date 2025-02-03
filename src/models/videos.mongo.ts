import mongoose, { Schema, Document } from "mongoose";
interface IVideo extends Document {
  EpisodeNo: Number;
  url: string;
}

const videoScheme: Schema = new mongoose.Schema({
  EpisodeNo: { type: Number, required: true },
  url: { type: String, required: true },
});

const animeVideo = mongoose.model<IVideo>("animeVideo", videoScheme);

export default animeVideo;
