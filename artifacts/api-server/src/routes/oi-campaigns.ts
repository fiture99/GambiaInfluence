import { Router, type IRouter, type Request, type Response } from "express";
import { db, oiCampaignsTable, oiUsersTable, influencersTable } from "@workspace/db";
import { eq, sum } from "drizzle-orm";
import { requireOiAdmin, requireOiAuth, safeUser } from "./oi-auth.js";

const router: IRouter = Router();

type AuthReq = Request & { oiUser?: { id: number; role: string; email: string; fullName: string; companyName: string | null; phone: string | null; createdAt: Date | null } };

router.get("/oi/campaigns", requireOiAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthReq).oiUser!;

  const campaigns = await db.select().from(oiCampaignsTable).orderBy(oiCampaignsTable.createdAt);

  const filtered = user.role === "admin" ? campaigns : campaigns.filter(c => c.clientId === user.id);

  const userIds = [...new Set(filtered.map(c => c.clientId))];
  const influencerIds = [...new Set(filtered.map(c => c.influencerId))];

  const [users, influencers] = await Promise.all([
    userIds.length > 0 ? db.select().from(oiUsersTable) : Promise.resolve([]),
    influencerIds.length > 0 ? db.select().from(influencersTable) : Promise.resolve([]),
  ]);

  const userMap = new Map(users.map(u => [u.id, u]));
  const influencerMap = new Map(influencers.map(i => [i.id, i]));

  res.json(filtered.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    budget: c.budget,
    status: c.status,
    postUrl: c.postUrl,
    postedAt: c.postedAt?.toISOString() ?? null,
    clientId: c.clientId,
    influencerId: c.influencerId,
    clientName: userMap.get(c.clientId)?.fullName ?? null,
    influencerName: influencerMap.get(c.influencerId)?.name ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })));
});

router.post("/oi/campaigns", requireOiAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, description, budget, clientId, influencerId } = req.body as {
    title?: string; description?: string; budget?: string; clientId?: number; influencerId?: number;
  };

  if (!title || !clientId || !influencerId) {
    res.status(400).json({ error: "title, clientId, influencerId are required" });
    return;
  }

  const [campaign] = await db.insert(oiCampaignsTable).values({
    title, description: description ?? null, budget: budget ?? null,
    clientId, influencerId,
  }).returning();

  if (!campaign) { res.status(500).json({ error: "Failed to create campaign" }); return; }

  const [client, influencer] = await Promise.all([
    db.select().from(oiUsersTable).where(eq(oiUsersTable.id, clientId)).limit(1),
    db.select().from(influencersTable).where(eq(influencersTable.id, influencerId)).limit(1),
  ]);

  res.status(201).json({
    ...campaign,
    postedAt: campaign.postedAt?.toISOString() ?? null,
    clientName: client[0]?.fullName ?? null,
    influencerName: influencer[0]?.name ?? null,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  });
});

router.get("/oi/campaigns/stats/summary", requireOiAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthReq).oiUser!;
  const all = await db.select().from(oiCampaignsTable);
  const campaigns = user.role === "admin" ? all : all.filter(c => c.clientId === user.id);

  const summary = {
    total: campaigns.length,
    pending: campaigns.filter(c => c.status === "pending").length,
    active: campaigns.filter(c => c.status === "active").length,
    posted: campaigns.filter(c => c.status === "posted").length,
    completed: campaigns.filter(c => c.status === "completed").length,
    cancelled: campaigns.filter(c => c.status === "cancelled").length,
    totalBudget: campaigns.reduce((acc, c) => {
      const b = parseFloat(c.budget ?? "0");
      return acc + (isNaN(b) ? 0 : b);
    }, 0).toFixed(2),
  };
  res.json(summary);
});

router.get("/oi/campaigns/:id", requireOiAuth, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [campaign] = await db.select().from(oiCampaignsTable).where(eq(oiCampaignsTable.id, id)).limit(1);
  if (!campaign) { res.status(404).json({ error: "Not found" }); return; }

  const user = (req as AuthReq).oiUser!;
  if (user.role !== "admin" && campaign.clientId !== user.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [clients, influencers] = await Promise.all([
    db.select().from(oiUsersTable).where(eq(oiUsersTable.id, campaign.clientId)).limit(1),
    db.select().from(influencersTable).where(eq(influencersTable.id, campaign.influencerId)).limit(1),
  ]);

  const client = clients[0];
  const influencer = influencers[0];

  res.json({
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    budget: campaign.budget,
    status: campaign.status,
    postUrl: campaign.postUrl,
    postedAt: campaign.postedAt?.toISOString() ?? null,
    clientId: campaign.clientId,
    influencerId: campaign.influencerId,
    client: client ? safeUser(client) : null,
    influencer: influencer ? {
      ...influencer,
      createdAt: influencer.createdAt.toISOString(),
      updatedAt: influencer.updatedAt.toISOString(),
    } : null,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  });
});

router.patch("/oi/campaigns/:id", requireOiAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { title, description, budget, status, postUrl } = req.body as {
    title?: string; description?: string; budget?: string;
    status?: string; postUrl?: string;
  };

  const updates: Record<string, unknown> = {};
  if (title) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (budget !== undefined) updates.budget = budget;
  if (status) updates.status = status;
  if (postUrl !== undefined) updates.postUrl = postUrl;
  if (status === "posted" && postUrl) updates.postedAt = new Date();

  const [updated] = await db.update(oiCampaignsTable).set(updates).where(eq(oiCampaignsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  res.json({
    ...updated,
    postedAt: updated.postedAt?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
});

router.delete("/oi/campaigns/:id", requireOiAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(oiCampaignsTable).where(eq(oiCampaignsTable.id, id));
  res.status(204).end();
});

export default router;
