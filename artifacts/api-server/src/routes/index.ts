import { Router, type IRouter } from "express";
import healthRouter from "./health";
import influencersRouter from "./influencers";
import businessesRouter from "./businesses";
import statsRouter from "./stats";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(influencersRouter);
router.use(businessesRouter);
router.use(statsRouter);

export default router;
