import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/tryCatch";
import Anime from "../models/anime.mongo";
import { CustomError } from "../middlewares/errors/CustomError";
import {
  checkAnimeExists,
  getMediasUrls,
  getUniqueMediaName,
} from "../helpers/utils";
import { AWS_BUCKET_NAME, PROFILE_URL } from "../helpers/envConfig";
import { uploadToS3 } from "../helpers/s3";
interface AnimeRequestBody {
  animeName: string;
  description: string;
  rating: number;
  totalEpisodes: number;
  animeType: string;
  quality: string;
}

export const addAnime = asyncHandler(
  async (req: Request<{}, {}, AnimeRequestBody>, res: Response) => {
    const {
      animeName,
      description,
      // animeVideo,
      rating,
      totalEpisodes,
      animeType,
      quality,
    } = req.body;
    // console.log(req.body);

    if (
      !animeName ||
      !description ||
      !rating ||
      !totalEpisodes ||
      !animeType ||
      !quality
    ) {
      throw new CustomError("All fields are required", 400);
    }
    if (!req.file) {
      throw new CustomError("Anime image is required", 400);
    }

    await checkAnimeExists(animeName); // function to verify existance of anime

    const animeImage = getUniqueMediaName(req.file.originalname);

    const anime = new Anime({
      animeName,
      description,
      rating,
      totalEpisodes,
      animeType,
      quality,
      animeImage,
    });

    await Promise.all([
      uploadToS3(
        AWS_BUCKET_NAME,
        animeImage,
        req.file.buffer,
        req.file.mimetype
      ),
      anime.save(),
    ]);

    const animeResponse = {
      id: anime._id,
      animeName: anime.animeName,
      description: anime.description,
      totalEpisodes: anime.totalEpisodes,
      animeType: anime.animeType,
      quality: anime.quality,
      animeImage: getMediasUrls(PROFILE_URL, anime.animeImage),
    };
    res.status(201).json({
      success: true,
      message: "Anime has been successfully added.",
      anime: animeResponse,
    });
  }
);
