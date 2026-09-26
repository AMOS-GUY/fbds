import { Router, type IRouter } from "express";
import { eq, ilike, and, type SQL } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListProductsResponse,
  CreateProductBody,
  GetProductParams,
  GetProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
  GetFeaturedProductsResponse,
} from "@workspace/api-zod";
import { requireAdminKey } from "../middlewares/adminAuth";

const router: IRouter = Router();

function serializeProduct(r: typeof productsTable.$inferSelect) {
  return {
    ...r,
    price: Number(r.price),
    stock: Number(r.stock),
    sizes: (r.sizes as string[]) ?? [],
    badge: r.badge ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { category, search, inStock } = query.data;
  const conditions: SQL[] = [];

  // Case-insensitive category matching so "bottles" and "Bottles" both work
  if (category) {
    conditions.push(ilike(productsTable.category, category));
  }
  if (search) {
    conditions.push(ilike(productsTable.name, `%${search}%`));
  }

  const rows = await db
    .select()
    .from(productsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(productsTable.createdAt);

  const filtered = inStock === true ? rows.filter((r) => Number(r.stock) > 0) : rows;

  res.json(ListProductsResponse.parse(filtered.map(serializeProduct)));
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.featured, true))
    .orderBy(productsTable.createdAt);

  res.json(GetFeaturedProductsResponse.parse(rows.map(serializeProduct)));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse(serializeProduct(row)));
});

// ── Admin-protected write routes ─────────────────────────────────────────────

router.post("/products", requireAdminKey, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(productsTable)
    .values({
      name: parsed.data.name,
      category: parsed.data.category,
      description: parsed.data.description,
      image: parsed.data.image,
      price: String(parsed.data.price),
      stock: parsed.data.stock,
      sizes: parsed.data.sizes ?? [],
      badge: parsed.data.badge ?? null,
      featured: parsed.data.featured ?? false,
    })
    .returning();

  res.status(201).json(GetProductResponse.parse(serializeProduct(row)));
});

router.patch("/products/:id", requireAdminKey, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof productsTable.$inferInsert> = {
    ...(parsed.data.name !== undefined && { name: parsed.data.name }),
    ...(parsed.data.category !== undefined && { category: parsed.data.category }),
    ...(parsed.data.description !== undefined && { description: parsed.data.description }),
    ...(parsed.data.image !== undefined && { image: parsed.data.image }),
    ...(parsed.data.price !== undefined && { price: String(parsed.data.price) }),
    ...(parsed.data.stock !== undefined && { stock: parsed.data.stock }),
    ...(parsed.data.sizes !== undefined && { sizes: parsed.data.sizes }),
    ...(parsed.data.featured !== undefined && { featured: parsed.data.featured }),
    ...(parsed.data.badge !== undefined && { badge: parsed.data.badge }),
  };

  const [row] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(UpdateProductResponse.parse(serializeProduct(row)));
});

router.delete("/products/:id", requireAdminKey, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.status(204).end();
});

export default router;
