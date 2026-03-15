import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import uploadToCloud from "../middlewares/uploadMiddleware.js";
const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

// Admin routes (protected)
router.post(
  "/",
  protect,
  isAdmin,
  uploadToCloud.array("images", 5),
  createProduct,
);
router.put(
  "/:id",
  protect,
  isAdmin,
  uploadToCloud.array("images", 5),
  updateProduct,
);
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;
