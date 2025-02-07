import { Router } from "express";
import {
  addAnime,
  createComment,
  createEpisodeAndStartVideoProcessing,
  generatePresignedUrlsForFileUpload,
  getAnimeById,
  getAllEpisodes,
  getAllAnimes
} from "../controllers/anime.controller";
import upload from "../middlewares/multer";

const animeRouter = Router();
animeRouter.post("/uploadanime", upload.single("animeImage"), addAnime);
animeRouter.post("/createComment", createComment);

animeRouter.post("/generate-presigned-urls", generatePresignedUrlsForFileUpload)
animeRouter.get("/anime/:animeId",getAnimeById)
animeRouter.post("/uploadepisode/anime/:animeId",createEpisodeAndStartVideoProcessing)
animeRouter.get("/getAllEpisodes/:animeId",getAllEpisodes)
animeRouter.get("/getAllAnimes",getAllAnimes)

export default animeRouter;

