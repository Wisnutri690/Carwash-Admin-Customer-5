import { Router } from "express";

import authRoutes from "./authRoutes";
import orderRoutes from "./orderRoutes";
import staffRoutes from "./staffRoutes";
import serviceRoutes from "./serviceRoutes";
import customerRoutes from "./customerRoutes";
import vehicleRoutes from "./vehicleRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);
router.use("/staff", staffRoutes);
router.use("/services", serviceRoutes);
router.use("/customers", customerRoutes);
router.use("/vehicles", vehicleRoutes);

export default router;