import mongoose, { Document, Schema } from "mongoose";

interface Ianime extends Document {
  animeId: string
  animeName: string;
  description: string;
  animeImage: string;
  animeVideo: mongoose.Schema.Types.ObjectId[];
  rating: number;
  totalEpisodes: number;
  animeType: string;
  quality: string;
  genre: string[];
  publishedAt: string;
}

const animeSchema: Schema = new mongoose.Schema({
  animeId: { type: String, required: true },
  animeName: { type: String, required: true },
  description: { type: String, required: true },
  animeImage: { type: String, required: true },
  genre: [{ type: String }],

  animeVideo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnimeVideo",

    },
  ],
  publishedAt: { type: String },
  moreSeasons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Anime",
  }],
  rating: { type: Number, required: true },
  totalEpisodes: { type: Number, required: true },
  animeType: { type: String, required: true },
  quality: { type: String, required: true },
});

const Anime = mongoose.model<Ianime>("Anime", animeSchema);
export default Anime;
