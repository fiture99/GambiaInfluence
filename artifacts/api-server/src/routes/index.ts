import { Router, type IRouter } from "express";
import healthRouter from "./health";
import influencersRouter from "./influencers";
import businessesRouter from "./businesses";
import statsRouter from "./stats";
import adminRouter from "./admin";
import oiAuthRouter from "./oi-auth";
import oiUsersRouter from "./oi-users";
import oiCampaignsRouter from "./oi-campaigns";
import oiQuickPromotionsRouter from "./oi-quick-promotions";
import promoRequestsRouter from "./promo-requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(influencersRouter);
router.use(businessesRouter);
router.use(statsRouter);
router.use(oiAuthRouter);
router.use(oiUsersRouter);
router.use(oiCampaignsRouter);
router.use(oiQuickPromotionsRouter);
router.use(promoRequestsRouter);

export default router;
