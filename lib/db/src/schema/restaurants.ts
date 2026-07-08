import {
  boolean,
  decimal,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const restaurantsTable = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  cuisine: varchar("cuisine", { length: 100 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull().default("4.0"),
  reviewCount: integer("review_count").notNull().default(0),
  deliveryTime: varchar("delivery_time", { length: 50 }).notNull().default("30-45 min"),
  deliveryFee: decimal("delivery_fee", { precision: 6, scale: 2 }).notNull().default("30"),
  minOrder: decimal("min_order", { precision: 6, scale: 2 }).notNull().default("100"),
  imageUrl: text("image_url").notNull().default(""),
  isOpen: boolean("is_open").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRestaurantSchema = createInsertSchema(restaurantsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurantsTable.$inferSelect;
