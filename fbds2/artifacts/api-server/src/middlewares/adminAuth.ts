import type { Request, Response, NextFunction } from "express";

const ADMIN_API_KEY = process.env["ADMIN_API_KEY"] ?? "horizon2026admin";

export function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"];
  if (!auth || auth !== `Bearer ${ADMIN_API_KEY}`) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }
  next();
}
