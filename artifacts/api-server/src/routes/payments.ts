import { Router, type IRouter } from "express";
import Razorpay from "razorpay";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

router.post("/payments/create-order", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { amount } = req.body; // amount in rupees, e.g. 450.50
  if (!amount || amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${req.userId}_${Date.now()}`,
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

export default router;