import mongoose, { Document, Schema } from "mongoose";

interface Ianime extends Document {
  animeName: string;
  description: string;
  animeImage: string;
  animeVideo: mongoose.Schema.Types.ObjectId;
  rating: number;
  totalEpisodes: number;
  animeType: string;
  quality: string;
}

const animeSchema: Schema = new mongoose.Schema({
  animeName: { type: String, required: true },
  description: { type: String, required: true },
  animeImage: { type: String, required: true },
  animeVideo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AnimeVideo",
    required: true,
  },
  rating: { type: Number, required: true },
  totalEpisodes: { type: Number, required: true },
  animeType: { type: String, required: true },
  quality: { type: String, required: true },
});

const Anime = mongoose.model<Ianime>("anime", animeSchema);
export default Anime;
