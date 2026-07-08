import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import crypto from "crypto";
import {
  db,
  cartItemsTable,
  menuItemsTable,
  ordersTable,
  orderItemsTable,
  restaurantsTable,
} from "@workspace/db";
import {
  ListOrdersResponse,
  PlaceOrderBody,
  PlaceOrderResponse,
  GetOrderParams,
  GetOrderResponse,
  CancelOrderParams,
  CancelOrderResponse,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

async function buildOrderResponse(orderId: number) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId));
  if (!order) return null;

  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, order.restaurantId));

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    userId: order.userId,
    restaurantId: order.restaurantId,
    restaurantName: restaurant?.name ?? "",
    items: items.map((i) => ({
      id: i.id,
      menuItemId: i.menuItemId,
      name: i.name,
      price: parseFloat(i.price),
      quantity: i.quantity,
      imageUrl: i.imageUrl,
    })),
    subtotal: parseFloat(order.subtotal),
    deliveryFee: parseFloat(order.deliveryFee),
    total: parseFloat(order.total),
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    estimatedDelivery: order.estimatedDelivery ?? null,
    createdAt: order.createdAt,
  };
}

router.get("/orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userOrders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, req.userId!))
    .orderBy(desc(ordersTable.createdAt));

  const results = await Promise.all(userOrders.map((o) => buildOrderResponse(o.id)));
  res.json(ListOrdersResponse.parse(results.filter(Boolean)));
});

router.post("/orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = PlaceOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // ---- Payment verification ----
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400).json({ error: "Payment details missing" });
    return;
  }
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  if (expectedSignature !== razorpaySignature) {
    res.status(400).json({ error: "Payment verification failed" });
    return;
  }
  // ---- end payment verification ----

  // Get cart items
  const cartItems = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.userId, req.userId!));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  // Enrich with menu data
  const enriched = await Promise.all(
    cartItems.map(async (ci) => {
      const [menuItem] = await db
        .select()
        .from(menuItemsTable)
        .where(eq(menuItemsTable.id, ci.menuItemId));
      return { ...ci, menuItem };
    }),
  );

  const restaurantId = enriched[0]?.menuItem?.restaurantId;
  if (!restaurantId) {
    res.status(400).json({ error: "Invalid cart items" });
    return;
  }

  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, restaurantId));
  const deliveryFee = parseFloat(restaurant?.deliveryFee ?? "30");
  const subtotal = enriched.reduce(
    (sum, i) => sum + parseFloat(i.menuItem?.price ?? "0") * i.quantity,
    0,
  );
  const total = subtotal + deliveryFee;

  const [order] = await db
    .insert(ordersTable)
    .values({
      userId: req.userId!,
      restaurantId,
      subtotal: subtotal.toString(),
      deliveryFee: deliveryFee.toString(),
      total: total.toString(),
      status: "confirmed",
      deliveryAddress: parsed.data.deliveryAddress,
      estimatedDelivery: "30-45 min",
    })
    .returning();

  // Insert order items
  await db.insert(orderItemsTable).values(
    enriched.map((i) => ({
      orderId: order.id,
      menuItemId: i.menuItemId,
      name: i.menuItem?.name ?? "",
      price: i.menuItem?.price ?? "0",
      quantity: i.quantity,
      imageUrl: i.menuItem?.imageUrl ?? "",
    })),
  );

  // Increment order counts
  await Promise.all(
    enriched.map((i) =>
      db
        .update(menuItemsTable)
        .set({ orderCount: (i.menuItem?.orderCount ?? 0) + i.quantity })
        .where(eq(menuItemsTable.id, i.menuItemId)),
    ),
  );

  // Clear cart
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));

  const result = await buildOrderResponse(order.id);
  res.status(201).json(PlaceOrderResponse.parse(result));
});

router.get("/orders/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const result = await buildOrderResponse(params.data.id);
  if (!result || result.userId !== req.userId) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(GetOrderResponse.parse(result));
});

router.patch("/orders/:id/cancel", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CancelOrderParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(
      and(eq(ordersTable.id, params.data.id), eq(ordersTable.userId, req.userId!)),
    );

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.status === "delivered" || order.status === "out_for_delivery") {
    res.status(400).json({ error: "Cannot cancel order at this stage" });
    return;
  }

  await db
    .update(ordersTable)
    .set({ status: "cancelled" })
    .where(eq(ordersTable.id, order.id));

  const result = await buildOrderResponse(order.id);
  res.json(CancelOrderResponse.parse(result));
});

export default router;