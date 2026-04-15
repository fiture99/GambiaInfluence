import { createHmac, timingSafeEqual } from "crypto";
import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";

function getAdminToken(): string {
  const password = process.env["ADMIN_PASSWORD"];
  const secret = process.env["SESSION_SECRET"];

  if (!password || !secret) {
    throw new Error("ADMIN_PASSWORD and SESSION_SECRET environment variables are required");
  }

  return createHmac("sha256", secret).update(password).digest("hex");
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);

  let validToken: string;
  try {
    validToken = getAdminToken();
  } catch {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  const tokenBuf = Buffer.from(token);
  const validBuf = Buffer.from(validToken);

  if (tokenBuf.length !== validBuf.length || !timingSafeEqual(tokenBuf, validBuf)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

const router: IRouter = Router();

router.post("/admin/login", (req: Request, res: Response): void => {
  const { password } = req.body as { password?: string };

  if (!password || typeof password !== "string") {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  const passwordBuf = Buffer.from(password);
  const adminPasswordBuf = Buffer.from(adminPassword);

  const match =
    passwordBuf.length === adminPasswordBuf.length &&
    timingSafeEqual(passwordBuf, adminPasswordBuf);

  if (!match) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  let token: string;
  try {
    token = getAdminToken();
  } catch {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  res.json({ token });
});

export default router;
