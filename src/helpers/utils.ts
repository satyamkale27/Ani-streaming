import { CustomError } from "../middlewares/errors/CustomError.js";
import Anime from "../models/anime.mongo.js";
import { v4 as uuid } from "uuid";

export const checkAnimeExists = async (animeName: String) => {
  const anime = await Anime.findOne({ animeName });
  if (anime) throw new CustomError("Anime already exists", 409);
};
export const getUniqueMediaName = (fileName: string) => {
  const uuidString = uuid();
  return `${Date.now()}_${uuidString}_${fileName}`;
};
export const getMediasUrls = (URI: string, objectKey: string) => {
  return `${URI}${objectKey}`;
};
