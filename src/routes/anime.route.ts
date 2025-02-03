import { Router } from "express";
import { addAnime } from "../controllers/anime.controller";
import upload from "../middlewares/multer";

const animeRouter = Router();
animeRouter.post("/uploadanime", upload.single("animeImage"), addAnime);

export default animeRouter;
