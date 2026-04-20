import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { db, oiUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

function getSecret(): string {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) throw new Error("SESSION_SECRET is required");
  return secret;
}

export function makeOiToken(userId: number, role: string): string {
  const payload = `${userId}:${role}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${sig}`;
}

export function verifyOiToken(token: string): { userId: number; role: string } | null {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const payload = Buffer.from(encoded, "base64").toString("utf8");
    const expectedSig = createHmac("sha256", getSecret()).update(payload).digest("hex");
    if (sig !== expectedSig) return null;
    const [userIdStr, role] = payload.split(":");
    const userId = parseInt(userIdStr ?? "", 10);
    if (!role || isNaN(userId)) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

export async function requireOiAuth(req: Request, res: Response, next: () => void): Promise<void> {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const parsed = verifyOiToken(token);
  if (!parsed) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [user] = await db.select().from(oiUsersTable).where(eq(oiUsersTable.id, parsed.userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as Request & { oiUser?: typeof user }).oiUser = user;
  next();
}

export async function requireOiAdmin(req: Request, res: Response, next: () => void): Promise<void> {
  await requireOiAuth(req, res, async () => {
    const user = (req as Request & { oiUser?: { role: string } }).oiUser;
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}

function safeUser(u: { id: number; email: string; fullName: string; role: string; companyName: string | null; phone: string | null; createdAt: Date | null }) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    companyName: u.companyName,
    phone: u.phone,
    createdAt: u.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

const router: IRouter = Router();

router.post("/oi/auth/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const [user] = await db.select().from(oiUsersTable).where(eq(oiUsersTable.email, email.trim().toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = makeOiToken(user.id, user.role);
  res.json({ token, user: safeUser(user) });
});

router.get("/oi/auth/me", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const parsed = verifyOiToken(token);
  if (!parsed) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [user] = await db.select().from(oiUsersTable).where(eq(oiUsersTable.id, parsed.userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(safeUser(user));
});

export { safeUser };
export default router;
