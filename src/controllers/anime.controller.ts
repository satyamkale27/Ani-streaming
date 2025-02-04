import { Request, Response } from "express";
import asyncHandler from "../middlewares/tryCatch";
import Anime from "../models/anime.mongo";
import AnimeVideo from "../models/videos.mongo";
import Comment from "../models/comments.mongo";
import { CustomError } from "../middlewares/errors/CustomError";
import {
  checkAnimeExists,
  getMediasUrls,
  getUniqueMediaName,
} from "../helpers/utils";
import {
  AWS_BUCKET_NAME,
  AWS_VIDEO_BUCKET,
  PROFILE_URL,
} from "../helpers/envConfig";
import { generatePresignedUrl, uploadToS3 } from "../helpers/s3";
import sendMessage from "../helpers/rabbitmq-producer";
import redisClient from "../helpers/redisClient";

interface AnimeRequestBody {
  animeName: string;
  description: string;
  rating: number;
  totalEpisodes: number;
  animeType: string;
  quality: string;
}

function generateStringIdForAnime(name: string) {
  // Convert name to lowercase and replace spaces with hyphens
  let modifiedName = name.toLowerCase().replace(/\s+/g, '-');

  // Generate a random number to append to the name (you can change the range as needed)
  const randomNum = Math.floor(Math.random() * 10000) + 1000; // Generates a number between 1000 and 1999

  // Return the final modified name with the random number
  return `${modifiedName}-${randomNum}`;
}


export const addAnime = asyncHandler(
  async (req: Request<{}, {}, AnimeRequestBody>, res: Response) => {
    const {
      animeName,
      description,
      rating,
      totalEpisodes,
      animeType,
      quality,
    } = req.body

    if (
      !animeName ||
      !description ||
      !rating ||
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
      animeId: generateStringIdForAnime(animeName),
      animeName,
      description,
      rating,
      // totalEpisodes,
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
      animeId: anime.animeId,
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

export const generatePresignedUrlsForFileUpload = asyncHandler(
  async (req: Request, res: Response) => {
    const { filename, filetype, animeId } = req.body;

    // Check if files exist
    if (!filename || !filetype) {
      throw new CustomError("file Details are required", 400);
    }

    const uploadedFileName = getUniqueMediaName(filename);
    const path = `${animeId}/${uploadedFileName}`;

    const presignedUrl = await generatePresignedUrl(
      AWS_VIDEO_BUCKET,
      path,
      filetype
    );

    // Respond with presigned URLs and post content data
    return res.status(200).json({
      success: true,
      message: "Presigned URLs generated successfully",
      filename: path,
      presignedUrl,
    });
  }
);

export const addDataAndStartViedoTranscoding = asyncHandler(
  async (req: Request, res: Response) => {
    const { filename } = req.body;

    const data = {
      filename,
      bucket: AWS_VIDEO_BUCKET,
    };
    sendMessage(data).catch((err) => console.error("error", err));

    const response = {
      success: true,
      message: "Video Proccessing Started.",
    };

    res.status(200).json(response);
  }
);


export const createComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { videoId, userId, comment, isSpoiler } = req.body;

    if (!videoId || !userId || !comment)
      throw new CustomError("All fields are required");

    const commentobj = new Comment({
      videoId,
      userId,
      comment,
      isSpoiler,
    });

    await commentobj.save();

    await AnimeVideo.findByIdAndUpdate(videoId, {
      $push: { comments: commentobj._id },
    });

    const commentResponse = {
      id: commentobj._id,
    };

    res.status(201).json({
      success: true,
      message: "Comment added successfully. ",
      comment: commentResponse,
    });
  }
);

export const getAnimeById = asyncHandler(async (req: Request, res: Response) => {
  const { animeId } = req.params;

  if (!animeId) {
    throw new CustomError("animeId is required", 400);
  }

  // Try to get the anime from Redis cache first
  let anime = await redisClient.get(animeId);

  if (!anime) {
    // If not found in Redis, query the database
    anime = await Anime.findOne({ animeId });
    if (!anime) {
      throw new CustomError("Anime not found", 404);
    }

    // Format the response object
    const formatResponseAnime = {
      ...anime?.toObject(),
      animeImage: getMediasUrls(PROFILE_URL, anime.animeImage),
    };

    console.log("found in db")
    // Cache the result in Redis for future requests
    await redisClient.set(animeId, JSON.stringify(formatResponseAnime));
    await redisClient.expire(animeId, 1200);
    
    return res.status(200).json({ success: true, anime: formatResponseAnime });
  }

  console.log("found in redis")

  // If found in Redis, parse and return the cached anime
  return res.status(200).json({ success: true, anime: JSON.parse(anime) });
});


