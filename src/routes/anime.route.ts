import { Router } from "express";
import { addAnime, addDataAndStartViedoTranscoding, generatePresignedUrlsForFileUpload } from "../controllers/anime.controller";
import upload from "../middlewares/multer";

const animeRouter = Router();
animeRouter.post("/uploadanime", upload.single("animeImage"), addAnime);
animeRouter.post("/generate-presigned-urls", generatePresignedUrlsForFileUpload)
animeRouter.post("/addDataAndStartViedoTranscoding", addDataAndStartViedoTranscoding)

export default animeRouter;
