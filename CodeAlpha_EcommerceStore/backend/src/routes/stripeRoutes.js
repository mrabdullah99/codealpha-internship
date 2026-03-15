import express from "express";
import {
  createCheckoutSession,
  verifyPayment,
} from "../controllers/stripeController.js";
import { protect } from "../middlewares/authMiddleware.js";

const stripeRoutes = express.Router();

stripeRoutes.post("/verify-payment", protect, verifyPayment);
stripeRoutes.post("/create-checkout-session", protect, createCheckoutSession);

export default stripeRoutes;
