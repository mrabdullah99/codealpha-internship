import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderToDelivered,
} from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/myorders", protect, getUserOrders);
router.get("/", protect, isAdmin, getAllOrders);
router.patch("/:id/deliver", protect, isAdmin, updateOrderToDelivered);

export default router;
