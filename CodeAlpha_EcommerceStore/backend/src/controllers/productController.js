import Product from "../models/Product.js";
import cloudinary from "../config/cloudinaryConfig.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      brand,
      color,
      category,
      stock,
    } = req.body;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        message:
          "Please provide all required fields: name, description, price, category, stock",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one product image",
      });
    }

    const imageUrls = req.files.map((file) => file.path);

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      offerPrice: originalPrice ? Number(originalPrice) : null,
      images: imageUrls,
      brand: brand || "Generic",
      color: color || "Not specified",
      category,
      stock: Number(stock),
      date: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, brand } = req.query;

    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (brand) {
      filter.brand = new RegExp(brand, "i");
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      brand,
      color,
      category,
      stock,
      existingImages,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let updatedImages = [];

    if (existingImages) {
      const existingArray = Array.isArray(existingImages)
        ? existingImages
        : [existingImages];
      updatedImages = [...existingArray];
    }

    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => file.path);
      updatedImages = [...updatedImages, ...newImageUrls];
    }

    if (updatedImages.length === 0) {
      updatedImages = product.images;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.offerPrice =
      originalPrice !== undefined ? originalPrice : product.offerPrice;
    product.images = updatedImages;
    product.brand = brand || product.brand;
    product.color = color || product.color;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    for (const imageUrl of product.images) {
      const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0]; // products/filename

      await cloudinary.v2.uploader.destroy(publicId);
    }
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};
