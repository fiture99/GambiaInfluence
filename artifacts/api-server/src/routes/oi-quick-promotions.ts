import { Router, type IRouter, type Request, type Response } from "express";
import { db, oiQuickPromotionsTable, influencersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireOiAdmin } from "./oi-auth.js";

const router: IRouter = Router();

router.get("/oi/quick-promotions", requireOiAdmin, async (_req: Request, res: Response): Promise<void> => {
  const promos = await db.select().from(oiQuickPromotionsTable).orderBy(oiQuickPromotionsTable.createdAt);

  const influencerIds = [...new Set(promos.map(p => p.influencerId))];
  const influencers = influencerIds.length > 0
    ? await db.select({ id: influencersTable.id, name: influencersTable.name }).from(influencersTable)
    : [];
  const influencerMap = new Map(influencers.map(i => [i.id, i.name]));

  res.json(promos.map(p => ({
    id: p.id,
    influencerId: p.influencerId,
    influencerName: influencerMap.get(p.influencerId) ?? null,
    contactName: p.contactName,
    contactEmail: p.contactEmail,
    contactPhone: p.contactPhone,
    description: p.description,
    promoType: p.promoType,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/oi/quick-promotions", async (req: Request, res: Response): Promise<void> => {
  const { influencerId, contactName, contactEmail, contactPhone, description, promoType } = req.body as {
    influencerId?: number; contactName?: string; contactEmail?: string;
    contactPhone?: string; description?: string; promoType?: string;
  };

  if (!influencerId || !contactName || !description || !promoType) {
    res.status(400).json({ error: "influencerId, contactName, description, promoType are required" });
    return;
  }

  const [promo] = await db.insert(oiQuickPromotionsTable).values({
    influencerId,
    contactName: contactName.trim(),
    contactEmail: contactEmail ?? null,
    contactPhone: contactPhone ?? null,
    description: description.trim(),
    promoType: promoType.trim(),
  }).returning();

  if (!promo) { res.status(500).json({ error: "Failed to submit" }); return; }

  const [influencer] = await db.select({ name: influencersTable.name })
    .from(influencersTable).where(eq(influencersTable.id, influencerId)).limit(1);

  res.status(201).json({
    id: promo.id,
    influencerId: promo.influencerId,
    influencerName: influencer?.name ?? null,
    contactName: promo.contactName,
    contactEmail: promo.contactEmail,
    contactPhone: promo.contactPhone,
    description: promo.description,
    promoType: promo.promoType,
    status: promo.status,
    createdAt: promo.createdAt.toISOString(),
  });
});

router.patch("/oi/quick-promotions/:id", requireOiAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status } = req.body as { status?: string };
  if (!status) { res.status(400).json({ error: "status is required" }); return; }

  const [updated] = await db.update(oiQuickPromotionsTable)
    .set({ status: status as "new" | "contacted" | "in_progress" | "done" })
    .where(eq(oiQuickPromotionsTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  const [influencer] = await db.select({ name: influencersTable.name })
    .from(influencersTable).where(eq(influencersTable.id, updated.influencerId)).limit(1);

  res.json({
    id: updated.id,
    influencerId: updated.influencerId,
    influencerName: influencer?.name ?? null,
    contactName: updated.contactName,
    contactEmail: updated.contactEmail,
    contactPhone: updated.contactPhone,
    description: updated.description,
    promoType: updated.promoType,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
