import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, ordersTable, productsTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  ListOrdersResponse,
  CreateOrderBody,
  TrackOrderQueryParams,
  TrackOrderResponse,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
} from "@workspace/api-zod";
import { requireAdminKey } from "../middlewares/adminAuth";

const router: IRouter = Router();

function serializeOrder(r: typeof ordersTable.$inferSelect) {
  return {
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
  };
}

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${rand}`;
}

// ── Admin-only ─────────────────────────────────────────────────────────────

router.get("/orders", requireAdminKey, async (req, res): Promise<void> => {
  const query = ListOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = query.data.status
    ? await db.select().from(ordersTable).where(eq(ordersTable.status, query.data.status)).orderBy(ordersTable.createdAt)
    : await db.select().from(ordersTable).orderBy(ordersTable.createdAt);

  res.json(ListOrdersResponse.parse(rows.map(serializeOrder)));
});

// ── Public: create order ───────────────────────────────────────────────────

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { subtotal, storeDiscount, platformOffers, finalTotal, items, ...rest } = parsed.data;

  const [row] = await db
    .insert(ordersTable)
    .values({
      ...rest,
      items,
      orderId: generateOrderId(),
      subtotal: String(subtotal),
      storeDiscount: String(storeDiscount ?? 0),
      platformOffers: String(platformOffers ?? 0),
      finalTotal: String(finalTotal),
      status: "pending",
    })
    .returning();

  // Decrement stock for each item (best-effort — order still succeeds if this fails)
  for (const item of items) {
    try {
      await db
        .update(productsTable)
        .set({ stock: sql`GREATEST(0, ${productsTable.stock} - ${item.quantity})` })
        .where(eq(productsTable.id, item.productId));
    } catch {
      // Non-fatal
    }
  }

  res.status(201).json(GetOrderResponse.parse(serializeOrder(row)));
});

// ── Public: order tracking ─────────────────────────────────────────────────

router.get("/orders/track", async (req, res): Promise<void> => {
  const query = TrackOrderQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.orderId, query.data.orderId),
        eq(ordersTable.customerPhone, query.data.phone)
      )
    );

  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(TrackOrderResponse.parse(serializeOrder(row)));
});

// ── Admin-only: get order by id ────────────────────────────────────────────

router.get("/orders/:id", requireAdminKey, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(serializeOrder(row)));
});

// ── Admin-only: update order status ───────────────────────────────────────

router.patch("/orders/:id", requireAdminKey, async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(UpdateOrderStatusResponse.parse(serializeOrder(row)));
});

export default router;
