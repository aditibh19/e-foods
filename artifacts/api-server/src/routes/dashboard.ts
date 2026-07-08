import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  usersTable,
  restaurantsTable,
  ordersTable,
  orderItemsTable,
  menuItemsTable,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetRecentOrdersResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (_req, res): Promise<void> => {
  const [users, restaurants, orders, menuItems] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(restaurantsTable),
    db.select().from(ordersTable),
    db.select().from(menuItemsTable),
  ]);

  const categoryMap: Record<string, number> = {};
  for (const item of menuItems) {
    categoryMap[item.category] = (categoryMap[item.category] ?? 0) + item.orderCount;
  }
  const popularCategories = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const statusMap: Record<string, number> = {};
  for (const o of orders) {
    statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
  }
  const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }));

  res.json(
    GetDashboardSummaryResponse.parse({
      totalOrders: orders.length,
      totalRestaurants: restaurants.length,
      totalUsers: users.length,
      popularCategories,
      ordersByStatus,
    }),
  );
});

router.get("/dashboard/recent-orders", requireAuth, async (_req, res): Promise<void> => {
  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  const results = await Promise.all(
    recentOrders.map(async (order) => {
      const [restaurant] = await db
        .select()
        .from(restaurantsTable)
        .where(eq(restaurantsTable.id, order.restaurantId));
      const items = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));
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
    }),
  );

  res.json(GetRecentOrdersResponse.parse(results));
});

export default router;
