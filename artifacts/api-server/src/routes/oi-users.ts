import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db, oiUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireOiAdmin, safeUser } from "./oi-auth.js";

const router: IRouter = Router();

router.get("/oi/users", requireOiAdmin, async (_req: Request, res: Response): Promise<void> => {
  const users = await db.select().from(oiUsersTable).orderBy(oiUsersTable.createdAt);
  res.json(users.map(safeUser));
});

router.post("/oi/users", requireOiAdmin, async (req: Request, res: Response): Promise<void> => {
  const { email, password, fullName, role, companyName, phone } = req.body as {
    email?: string; password?: string; fullName?: string;
    role?: string; companyName?: string; phone?: string;
  };

  if (!email || !password || !fullName || !role) {
    res.status(400).json({ error: "email, password, fullName, role are required" });
    return;
  }

  const existing = await db.select({ id: oiUsersTable.id }).from(oiUsersTable).where(eq(oiUsersTable.email, email.trim().toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(oiUsersTable).values({
    email: email.trim().toLowerCase(),
    passwordHash,
    fullName: fullName.trim(),
    role: role as "admin" | "client",
    companyName: companyName ?? null,
    phone: phone ?? null,
  }).returning();

  if (!user) { res.status(500).json({ error: "Failed to create user" }); return; }
  res.status(201).json(safeUser(user));
});

router.patch("/oi/users/:id", requireOiAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { email, fullName, companyName, phone, password } = req.body as {
    email?: string; fullName?: string; companyName?: string; phone?: string; password?: string;
  };

  const updates: Partial<{ email: string; fullName: string; companyName: string; phone: string; passwordHash: string }> = {};
  if (email) updates.email = email.trim().toLowerCase();
  if (fullName) updates.fullName = fullName.trim();
  if (companyName !== undefined) updates.companyName = companyName;
  if (phone !== undefined) updates.phone = phone;
  if (password) updates.passwordHash = await bcrypt.hash(password, 12);

  const [updated] = await db.update(oiUsersTable).set(updates).where(eq(oiUsersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json(safeUser(updated));
});

router.delete("/oi/users/:id", requireOiAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(oiUsersTable).where(eq(oiUsersTable.id, id));
  res.status(204).end();
});

export default router;
