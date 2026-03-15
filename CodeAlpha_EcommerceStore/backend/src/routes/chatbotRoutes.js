import express from "express";
import { chatWithAI } from "../controllers/chatbotController.js";

const chatbotRoutes = express.Router();

chatbotRoutes.post("/", chatWithAI);

export default chatbotRoutes;
