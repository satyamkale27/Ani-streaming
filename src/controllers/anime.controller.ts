import { Request, Response, NextFunction } from "express";
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

    console.log(req.body, "req.body");

    const data = {
      filename,
      bucket: AWS_VIDEO_BUCKET,
    };
    sendMessage(data).catch((err) => console.error("error", err));

    const response = {
      success: true,
      message: "Video Proccessing Started.",
    };

    console.log(response, "response");

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
