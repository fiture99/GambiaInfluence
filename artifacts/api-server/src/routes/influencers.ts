import { Router, type IRouter } from "express";
import { eq, desc, ilike, and } from "drizzle-orm";
import { db, influencersTable } from "@workspace/db";
import { requireAdmin } from "./admin";
import {
  ListInfluencersQueryParams,
  CreateInfluencerBody,
  GetInfluencerParams,
  GetInfluencerResponse,
  UpdateInfluencerParams,
  UpdateInfluencerBody,
  UpdateInfluencerResponse,
  DeleteInfluencerParams,
  ListInfluencersResponse,
  GetTopInfluencersQueryParams,
  GetTopInfluencersResponse,
} from "@workspace/api-zod";

type InfluencerRow = typeof influencersTable.$inferSelect;

function serializeInfluencer(row: InfluencerRow) {
  return {
    ...row,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

const router: IRouter = Router();

router.get("/influencers/top", async (req, res): Promise<void> => {
  const params = GetTopInfluencersQueryParams.safeParse(req.query);
  const limit = params.success && params.data.limit ? params.data.limit : 6;

  const influencers = await db
    .select()
    .from(influencersTable)
    .orderBy(desc(influencersTable.followersCount))
    .limit(limit);

  res.json(GetTopInfluencersResponse.parse(influencers.map(serializeInfluencer)));
});

router.get("/influencers", async (req, res): Promise<void> => {
  const parsed = ListInfluencersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { location, niche, search } = parsed.data;

  const conditions = [];
  if (location) conditions.push(ilike(influencersTable.location, `%${location}%`));
  if (niche) conditions.push(ilike(influencersTable.niche, `%${niche}%`));
  if (search) conditions.push(ilike(influencersTable.name, `%${search}%`));

  const influencers = await db
    .select()
    .from(influencersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(influencersTable.followersCount));

  res.json(ListInfluencersResponse.parse(influencers.map(serializeInfluencer)));
});

router.post("/influencers", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateInfluencerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [influencer] = await db
    .insert(influencersTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(GetInfluencerResponse.parse(serializeInfluencer(influencer)));
});

router.get("/influencers/:id", async (req, res): Promise<void> => {
  const params = GetInfluencerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [influencer] = await db
    .select()
    .from(influencersTable)
    .where(eq(influencersTable.id, params.data.id));

  if (!influencer) {
    res.status(404).json({ error: "Influencer not found" });
    return;
  }

  res.json(GetInfluencerResponse.parse(serializeInfluencer(influencer)));
});

router.patch("/influencers/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateInfluencerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInfluencerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [influencer] = await db
    .update(influencersTable)
    .set(parsed.data)
    .where(eq(influencersTable.id, params.data.id))
    .returning();

  if (!influencer) {
    res.status(404).json({ error: "Influencer not found" });
    return;
  }

  res.json(UpdateInfluencerResponse.parse(serializeInfluencer(influencer)));
});

router.delete("/influencers/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteInfluencerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(influencersTable)
    .where(eq(influencersTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Influencer not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
