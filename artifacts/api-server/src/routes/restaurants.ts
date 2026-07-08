import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, restaurantsTable } from "@workspace/db";
import {
  ListRestaurantsQueryParams,
  ListRestaurantsResponse,
  CreateRestaurantBody,
  CreateRestaurantResponse,
  GetRestaurantParams,
  GetRestaurantResponse,
  GetFeaturedRestaurantsResponse,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

function mapRestaurant(r: typeof restaurantsTable.$inferSelect) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    cuisine: r.cuisine,
    rating: parseFloat(r.rating),
    reviewCount: r.reviewCount,
    deliveryTime: r.deliveryTime,
    deliveryFee: parseFloat(r.deliveryFee),
    minOrder: parseFloat(r.minOrder),
    imageUrl: r.imageUrl,
    isOpen: r.isOpen,
    address: r.address ?? null,
    createdAt: r.createdAt,
  };
}

router.get("/restaurants", async (req, res): Promise<void> => {
  const params = ListRestaurantsQueryParams.safeParse(req.query);
  const query = params.success ? params.data : {};

  let rows = await db.select().from(restaurantsTable);

  if (query.category) {
    rows = rows.filter((r) =>
      r.cuisine.toLowerCase().includes(query.category!.toLowerCase()),
    );
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    rows = rows.filter(
      (r) => r.name.toLowerCase().includes(s) || r.cuisine.toLowerCase().includes(s),
    );
  }

  res.json(ListRestaurantsResponse.parse(rows.map(mapRestaurant)));
});

router.get("/restaurants/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.isFeatured, true));
  res.json(GetFeaturedRestaurantsResponse.parse(rows.map(mapRestaurant)));
});

router.post("/restaurants", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateRestaurantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(restaurantsTable)
    .values({
      ...parsed.data,
      deliveryFee: String(parsed.data.deliveryFee),
      minOrder: String(parsed.data.minOrder),
    })
    .returning();
  res.status(201).json(CreateRestaurantResponse.parse(mapRestaurant(row)));
});

router.get("/restaurants/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetRestaurantParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }
  res.json(GetRestaurantResponse.parse(mapRestaurant(row)));
});

export default router;
