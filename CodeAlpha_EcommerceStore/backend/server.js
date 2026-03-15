import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import stripeRoutes from "./src/routes/stripeRoutes.js";
import chatbotRoutes from "./src/routes/chatbotRoutes.js";

connectDB();
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ecommerce-store-pied-ten.vercel.app",
    ],
    credentials: true,
  }),
);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/chatbot", chatbotRoutes);

const port = process.env.PORT;
app.listen(port, () => console.log(`Server is running on ${port}`));
