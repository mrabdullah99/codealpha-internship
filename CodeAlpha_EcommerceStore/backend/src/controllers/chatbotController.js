import { GoogleGenAI } from "@google/genai";
import Product from "../models/Product.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

let STORE_AND_PRODUCTS_CONTEXT = null;

const loadStoreContext = async () => {
  if (STORE_AND_PRODUCTS_CONTEXT) return STORE_AND_PRODUCTS_CONTEXT;

  const products = await Product.find({}).select(
    "name price category description",
  );

  const productContext = products
    .map(
      (p) =>
        `• ${p.name} | $${p.price} | Category: ${p.category}\n  ${p.description}`,
    )
    .join("\n");

  STORE_AND_PRODUCTS_CONTEXT = `
You are a helpful ecommerce assistant for an ecommerce website.

Store info:
- Categories: Headphones, Gadgets, Electronics
- Your goals:
  - Help users find products
  - Answer product-related questions
  - Recommend suitable products from the catalog
  - Be concise, friendly, and honest
  - Never invent products that are not listed
- Product list:
${productContext}
`;

  return STORE_AND_PRODUCTS_CONTEXT;
};

export const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !messages.length) {
      return res.status(400).json({ message: "Messages are required" });
    }

    const storeContext = await loadStoreContext();

    const MAX_MEMORY = parseInt(process.env.CHAT_MEMORY_LIMIT) || 5;
    const recentMessages = messages.slice(-MAX_MEMORY);

    const contents = [
      {
        role: "user",
        parts: [{ text: storeContext }],
      },
      ...recentMessages.map((msg) => ({
        role: msg.from === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents,
    });

    const reply =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No reply from AI";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        message: "You have exceeded your API quota. Please try again later.",
      });
    }

    res.status(500).json({
      message: "AI failed to respond",
      details: error.message,
    });
  }
};
