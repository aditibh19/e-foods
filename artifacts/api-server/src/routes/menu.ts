import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, menuItemsTable } from "@workspace/db";
import {
  GetRestaurantMenuParams,
  GetRestaurantMenuResponse,
  CreateMenuItemParams,
  CreateMenuItemBody,
  CreateMenuItemResponse,
  ListMenuCategoriesResponse,
  GetBestsellersResponse,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

const CATEGORIES = [
  { name: "Chinese", icon: "🍜" },
  { name: "Pizza", icon: "🍕" },
  { name: "Rolls", icon: "🌯" },
  { name: "Paratha", icon: "🫓" },
  { name: "Burger", icon: "🍔" },
  { name: "South Indian", icon: "🍛" },
  { name: "Pasta", icon: "🍝" },
  { name: "Sandwich", icon: "🥪" },
  { name: "Cakes", icon: "🎂" },
  { name: "Pastries", icon: "🥐" },
  { name: "Shakes", icon: "🥤" },
  { name: "Special Foods", icon: "⭐" },
];

function mapItem(m: typeof menuItemsTable.$inferSelect) {
  return {
    id: m.id,
    restaurantId: m.restaurantId,
    name: m.name,
    description: m.description,
    price: parseFloat(m.price),
    category: m.category,
    imageUrl: m.imageUrl,
    isAvailable: m.isAvailable,
    isVeg: m.isVeg,
    isBestseller: m.isBestseller,
    rating: m.rating ? parseFloat(m.rating) : null,
    orderCount: m.orderCount,
  };
}

router.get("/restaurants/:restaurantId/menu", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.restaurantId)
    ? req.params.restaurantId[0]
    : req.params.restaurantId;
  const params = GetRestaurantMenuParams.safeParse({ restaurantId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid restaurantId" });
    return;
  }
  const rows = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.restaurantId, params.data.restaurantId));
  res.json(GetRestaurantMenuResponse.parse(rows.map(mapItem)));
});

router.post("/restaurants/:restaurantId/menu", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.restaurantId)
    ? req.params.restaurantId[0]
    : req.params.restaurantId;
  const pathParams = CreateMenuItemParams.safeParse({ restaurantId: parseInt(raw, 10) });
  if (!pathParams.success) {
    res.status(400).json({ error: "Invalid restaurantId" });
    return;
  }
  const parsed = CreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(menuItemsTable)
    .values({
      ...parsed.data,
      restaurantId: pathParams.data.restaurantId,
      price: String(parsed.data.price),
    })
    .returning();
  res.status(201).json(CreateMenuItemResponse.parse(mapItem(row)));
});

router.get("/menu/categories", async (_req, res): Promise<void> => {
  // Count items per category
  const allItems = await db.select().from(menuItemsTable);
  const counts: Record<string, number> = {};
  for (const item of allItems) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }
  const categories = CATEGORIES.map((c) => ({
    name: c.name,
    icon: c.icon,
    itemCount: counts[c.name] ?? 0,
  }));
  res.json(ListMenuCategoriesResponse.parse(categories));
});

router.get("/menu/bestsellers", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.isBestseller, true))
    .orderBy(desc(menuItemsTable.orderCount))
    .limit(12);
  res.json(GetBestsellersResponse.parse(rows.map(mapItem)));
});

export default router;
