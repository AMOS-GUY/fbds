import { Router, type IRouter } from "express";
import { db, contactMessagesTable, newsletterTable } from "@workspace/db";
import { SubmitContactBody, SubscribeNewsletterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/contact", async (req, res): Promise<void> => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(contactMessagesTable).values(parsed.data).returning();

  res.status(201).json({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    subject: row.subject,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  });
});

router.post("/newsletter", async (req, res): Promise<void> => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    await db.insert(newsletterTable).values({ email: parsed.data.email });
    res.status(201).json({ message: "Successfully subscribed to newsletter" });
  } catch {
    res.status(400).json({ message: "Email is already subscribed" });
  }
});

export default router;
