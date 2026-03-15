import Order from "../models/Order.js";
import Product from "../models/Product.js";
import dotenv from "dotenv";
dotenv.config();

export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }
    }
    const order = new Order({
      user: req.user._id,
      products,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const createdOrder = await order.save();

    await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.quantity;
          if (product.stock < 0) product.stock = 0;
          await product.save();
        }
      }),
    );

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Create order error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create order" });
  }
};

export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

export const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = "Delivered";
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "id name");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};
