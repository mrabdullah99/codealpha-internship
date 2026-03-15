import User from "../models/User.js";
import Product from "../models/Product.js";

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity;
    } else {
      user.cart.push({
        product: productId,
        quantity,
      });
    }

    await user.save();

    await user.populate("cart.product");

    res.json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    res.json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user._id);

    if (quantity === 0) {
      user.cart = user.cart.filter(
        (item) => item.product.toString() !== productId,
      );
    } else {
      const itemIndex = user.cart.findIndex(
        (item) => item.product.toString() === productId,
      );

      if (itemIndex > -1) {
        user.cart[itemIndex].quantity = quantity;
      } else {
        user.cart.push({
          product: productId,
          quantity,
        });
      }
    }

    await user.save();
    await user.populate("cart.product");

    res.json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId,
    );

    await user.save();
    await user.populate("cart.product");

    res.json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({ message: "Cart cleared successfully", cart: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
