import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, cartItemsTable, menuItemsTable, restaurantsTable } from "@workspace/db";
import {
  GetCartResponse,
  ClearCartResponse,
  AddCartItemBody,
  AddCartItemResponse,
  UpdateCartItemParams,
  UpdateCartItemBody,
  UpdateCartItemResponse,
  RemoveCartItemParams,
  RemoveCartItemResponse,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

async function buildCart(userId: number) {
  const cartItems = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.userId, userId));

  if (cartItems.length === 0) {
    return {
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      restaurantId: null,
      restaurantName: null,
    };
  }

  // Enrich items with menu data
  const enriched = await Promise.all(
    cartItems.map(async (ci) => {
      const [menuItem] = await db
        .select()
        .from(menuItemsTable)
        .where(eq(menuItemsTable.id, ci.menuItemId));
      return {
        id: ci.id,
        menuItemId: ci.menuItemId,
        name: menuItem?.name ?? "",
        price: parseFloat(menuItem?.price ?? "0"),
        quantity: ci.quantity,
        imageUrl: menuItem?.imageUrl ?? "",
        isVeg: menuItem?.isVeg ?? false,
        restaurantId: menuItem?.restaurantId,
      };
    }),
  );

  const restaurantId = enriched[0]?.restaurantId ?? null;
  let restaurantName: string | null = null;
  let deliveryFee = 0;

  if (restaurantId) {
    const [rest] = await db
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.id, restaurantId));
    restaurantName = rest?.name ?? null;
    deliveryFee = parseFloat(rest?.deliveryFee ?? "30");
  }

  const subtotal = enriched.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items: enriched.map(({ restaurantId: _rid, ...rest }) => rest),
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    restaurantId: restaurantId ?? null,
    restaurantName,
  };
}

router.get("/cart", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const cart = await buildCart(req.userId!);
  res.json(GetCartResponse.parse(cart));
});

router.delete("/cart", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));
  res.json(ClearCartResponse.parse({ message: "Cart cleared" }));
});

router.post("/cart/items", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = AddCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { menuItemId, quantity } = parsed.data;
  const [menuItem] = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.id, menuItemId));
  if (!menuItem) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  // Check if from same restaurant — if different, clear cart first
  const existingItems = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.userId, req.userId!));

  if (existingItems.length > 0) {
    const [firstItem] = await db
      .select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, existingItems[0].menuItemId));
    if (firstItem && firstItem.restaurantId !== menuItem.restaurantId) {
      // Clear cart from old restaurant
      await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));
    }
  }

  // Upsert cart item
  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.userId, req.userId!),
        eq(cartItemsTable.menuItemId, menuItemId),
      ),
    );

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      userId: req.userId!,
      menuItemId,
      quantity,
    });
  }

  const cart = await buildCart(req.userId!);
  res.json(AddCartItemResponse.parse(cart));
});

router.patch("/cart/items/:itemId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const pathParams = UpdateCartItemParams.safeParse({ itemId: parseInt(raw, 10) });
  if (!pathParams.success) {
    res.status(400).json({ error: "Invalid itemId" });
    return;
  }
  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { itemId } = pathParams.data;
  const { quantity } = parsed.data;

  if (quantity === 0) {
    await db
      .delete(cartItemsTable)
      .where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.userId, req.userId!)));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.userId, req.userId!)));
  }

  const cart = await buildCart(req.userId!);
  res.json(UpdateCartItemResponse.parse(cart));
});

router.delete("/cart/items/:itemId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const pathParams = RemoveCartItemParams.safeParse({ itemId: parseInt(raw, 10) });
  if (!pathParams.success) {
    res.status(400).json({ error: "Invalid itemId" });
    return;
  }
  await db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.id, pathParams.data.itemId),
        eq(cartItemsTable.userId, req.userId!),
      ),
    );
  const cart = await buildCart(req.userId!);
  res.json(RemoveCartItemResponse.parse(cart));
});

export default router;
