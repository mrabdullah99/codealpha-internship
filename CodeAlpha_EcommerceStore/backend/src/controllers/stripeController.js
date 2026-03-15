import Stripe from "stripe";
import Order from "../models/Order.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }
    const order = await Order.findById(orderId).populate("products.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const line_items = order.products.map((item) => {
      const product = item.product;
      const price = Number(product.offerPrice || product.price);
      const quantity = parseInt(item.quantity, 10);
      if (isNaN(price))
        throw new Error(`Invalid price for product: ${product.name}`);
      if (isNaN(quantity) || quantity < 1)
        throw new Error(`Invalid quantity for product: ${product.name}`);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata: {
        orderId: order._id.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/myorders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/myorders?payment=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error FULL:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const orderId = session.metadata.orderId;
      const order = await Order.findById(orderId);

      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = "Paid";
        order.paymentResult = {
          id: session.payment_intent,
          status: session.payment_status,
          email: session.customer_details?.email,
        };
        await order.save();
      }

      return res.json({ success: true, order });
    }

    res.json({ success: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
