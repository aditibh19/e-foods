import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import restaurantsRouter from "./restaurants";
import menuRouter from "./menu";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import dashboardRouter from "./dashboard";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(restaurantsRouter);
router.use(menuRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(dashboardRouter);
router.use(paymentsRouter);

export default router;