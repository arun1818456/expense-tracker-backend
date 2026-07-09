import express from "express";
import auth from "../../middleWare/authWare.js";
import { createFeedback } from "./controller.js";

const router = express.Router();

router.post('/feedback', auth, createFeedback);

export default router;