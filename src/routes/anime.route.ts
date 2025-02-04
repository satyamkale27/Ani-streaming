import { Router } from "express";
import {
  addAnime,
  addDataAndStartViedoTranscoding,
  createComment,
  generatePresignedUrlsForFileUpload,
  getAnimeById
} from "../controllers/anime.controller";
import upload from "../middlewares/multer";

const animeRouter = Router();
animeRouter.post("/uploadanime", upload.single("animeImage"), addAnime);
animeRouter.post("/createComment", createComment);

animeRouter.post("/generate-presigned-urls", generatePresignedUrlsForFileUpload)
animeRouter.get("/anime/:animeId",getAnimeById)
animeRouter.post("/uploadepisode/anime/:animeId",addDataAndStartViedoTranscoding)

export default animeRouter;

