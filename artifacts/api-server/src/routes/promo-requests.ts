import { Router, type IRouter, type Request, type Response } from "express";
import { db, oiQuickPromotionsTable, influencersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "./admin.js";

const router: IRouter = Router();

function serializePromo(p: typeof oiQuickPromotionsTable.$inferSelect, influencerName?: string | null) {
  return {
    id: p.id,
    influencerId: p.influencerId,
    influencerName: influencerName ?? null,
    contactName: p.contactName,
    contactEmail: p.contactEmail,
    contactPhone: p.contactPhone,
    description: p.description,
    promoType: p.promoType,
    status: p.status,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  };
}

router.post("/promo-requests", async (req: Request, res: Response): Promise<void> => {
  const { influencerId, contactName, contactEmail, contactPhone, description, promoType } = req.body as {
    influencerId?: number;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    description?: string;
    promoType?: string;
  };

  if (!influencerId || !contactName?.trim() || !description?.trim() || !promoType?.trim()) {
    res.status(400).json({ error: "influencerId, contactName, description, and promoType are required" });
    return;
  }

  const influencer = await db
    .select({ name: influencersTable.name })
    .from(influencersTable)
    .where(eq(influencersTable.id, influencerId))
    .limit(1);

  if (!influencer[0]) {
    res.status(404).json({ error: "Influencer not found" });
    return;
  }

  const [promo] = await db.insert(oiQuickPromotionsTable).values({
    influencerId,
    contactName: contactName.trim(),
    contactEmail: contactEmail?.trim() ?? null,
    contactPhone: contactPhone?.trim() ?? null,
    description: description.trim(),
    promoType: promoType.trim(),
  }).returning();

  if (!promo) { res.status(500).json({ error: "Failed to submit" }); return; }

  res.status(201).json(serializePromo(promo, influencer[0].name));
});

router.get("/promo-requests", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const promos = await db
    .select()
    .from(oiQuickPromotionsTable)
    .orderBy(desc(oiQuickPromotionsTable.createdAt));

  const influencerIds = [...new Set(promos.map(p => p.influencerId))];
  const influencers = influencerIds.length > 0
    ? await db.select({ id: influencersTable.id, name: influencersTable.name }).from(influencersTable)
    : [];
  const influencerMap = new Map(influencers.map(i => [i.id, i.name]));

  res.json(promos.map(p => serializePromo(p, influencerMap.get(p.influencerId))));
});

router.patch("/promo-requests/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id ?? "", 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status } = req.body as { status?: string };
  const allowed = ["new", "contacted", "in_progress", "done"];
  if (!status || !allowed.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
    return;
  }

  const [updated] = await db
    .update(oiQuickPromotionsTable)
    .set({ status: status as "new" | "contacted" | "in_progress" | "done" })
    .where(eq(oiQuickPromotionsTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Request not found" }); return; }

  const [influencer] = await db
    .select({ name: influencersTable.name })
    .from(influencersTable)
    .where(eq(influencersTable.id, updated.influencerId))
    .limit(1);

  res.json(serializePromo(updated, influencer?.name));
});

export default router;
