import { Router, type IRouter } from "express";
import { sql, desc } from "drizzle-orm";
import { db, influencersTable, businessesTable } from "@workspace/db";
import {
  GetPlatformStatsResponse,
  GetNicheBreakdownResponse,
  GetLocationBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/platform", async (_req, res): Promise<void> => {
  const [influencerStats] = await db
    .select({
      totalInfluencers: sql<number>`count(*)::int`,
      totalFollowers: sql<number>`coalesce(sum(${influencersTable.followersCount}), 0)::int`,
    })
    .from(influencersTable);

  const [businessStats] = await db
    .select({
      totalBusinesses: sql<number>`count(*)::int`,
    })
    .from(businessesTable);

  const topNicheResult = await db
    .select({
      niche: influencersTable.niche,
      count: sql<number>`count(*)::int`,
    })
    .from(influencersTable)
    .groupBy(influencersTable.niche)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  const topLocationResult = await db
    .select({
      location: influencersTable.location,
      count: sql<number>`count(*)::int`,
    })
    .from(influencersTable)
    .groupBy(influencersTable.location)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  const stats = {
    totalInfluencers: influencerStats?.totalInfluencers ?? 0,
    totalBusinesses: businessStats?.totalBusinesses ?? 0,
    totalFollowers: influencerStats?.totalFollowers ?? 0,
    topNiche: topNicheResult[0]?.niche ?? "N/A",
    topLocation: topLocationResult[0]?.location ?? "N/A",
  };

  res.json(GetPlatformStatsResponse.parse(stats));
});

router.get("/stats/niches", async (_req, res): Promise<void> => {
  const niches = await db
    .select({
      niche: influencersTable.niche,
      count: sql<number>`count(*)::int`,
    })
    .from(influencersTable)
    .groupBy(influencersTable.niche)
    .orderBy(desc(sql`count(*)`));

  res.json(GetNicheBreakdownResponse.parse(niches));
});

router.get("/stats/locations", async (_req, res): Promise<void> => {
  const locations = await db
    .select({
      location: influencersTable.location,
      count: sql<number>`count(*)::int`,
    })
    .from(influencersTable)
    .groupBy(influencersTable.location)
    .orderBy(desc(sql`count(*)`));

  res.json(GetLocationBreakdownResponse.parse(locations));
});

export default router;
