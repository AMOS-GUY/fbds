import { Router, type IRouter } from "express";
import { eq, count, sum } from "drizzle-orm";
import { db, productsTable, ordersTable } from "@workspace/db";
import { GetStoreStatsResponse } from "@workspace/api-zod";
import { requireAdminKey } from "../middlewares/adminAuth";

const router: IRouter = Router();

router.get("/stats", requireAdminKey, async (_req, res): Promise<void> => {
  const [productCount] = await db.select({ count: count() }).from(productsTable);
  const [orderCount] = await db.select({ count: count() }).from(ordersTable);

  const [pendingCount] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "pending"));

  const [revenueResult] = await db
    .select({ total: sum(ordersTable.finalTotal) })
    .from(ordersTable);

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt)
    .limit(5);

  const allProducts = await db.select({ category: productsTable.category }).from(productsTable);
  const categoryCounts: Record<string, number> = {};
  for (const p of allProducts) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
  }
  const categoryBreakdown = Object.entries(categoryCounts).map(([category, c]) => ({
    category,
    count: c,
  }));

  const serializeOrder = (r: typeof ordersTable.$inferSelect) => ({
    ...r,
    subtotal: Number(r.subtotal),
    storeDiscount: Number(r.storeDiscount),
    platformOffers: Number(r.platformOffers),
    finalTotal: Number(r.finalTotal),
    items: (r.items as Array<{
      productId: number;
      productName: string;
      image: string;
      quantity: number;
      size: string;
      unitPrice: number;
      totalPrice: number;
    }>) ?? [],
    customerEmail: r.customerEmail ?? null,
    destination: r.destination ?? null,
    notes: r.notes ?? null,
    createdAt: r.createdAt.toISOString(),
  });

  res.json(
    GetStoreStatsResponse.parse({
      totalProducts: productCount.count,
      totalOrders: orderCount.count,
      pendingOrders: pendingCount.count,
      totalRevenue: Number(revenueResult.total ?? 0),
      recentOrders: recentOrders.map(serializeOrder),
      categoryBreakdown,
    })
  );
});

export default router;
