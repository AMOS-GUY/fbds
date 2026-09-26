import { pgTable, text, serial, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  destination: text("destination"),
  status: text("status").notNull().default("pending"),
  items: jsonb("items").$type<Array<{
    productId: number;
    productName: string;
    image: string;
    quantity: number;
    size: string;
    unitPrice: number;
    totalPrice: number;
  }>>().notNull().default([]),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  storeDiscount: numeric("store_discount", { precision: 12, scale: 2 }).notNull().default("0"),
  platformOffers: numeric("platform_offers", { precision: 12, scale: 2 }).notNull().default("0"),
  finalTotal: numeric("final_total", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
