import express from "express";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartQuantity);
router.delete("/remove", removeFromCart);
router.delete("/clear", clearCart);

export default router;
