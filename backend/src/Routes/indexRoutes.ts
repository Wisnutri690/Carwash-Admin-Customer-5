import { Router } from "express";

import authRoutes from "./authRoutes";
import orderRoutes from "./orderRoutes";
import staffRoutes from "./staffRoutes";
import serviceRoutes from "./serviceRoutes";
import customerRoutes from "./customerRoutes";
import vehicleRoutes from "./vehicleRoutes";

import customerVehicleRoutes from "./CustomerSelfRoute/vehicleRoute";
import customerOrderRoutes from "./CustomerSelfRoute/orderRoute";
import customerProfileRoutes from "./CustomerSelfRoute/profileRoute";

const router = Router();

router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);
router.use("/staff", staffRoutes);
router.use("/services", serviceRoutes);
router.use("/customers", customerRoutes);
router.use("/vehicles", vehicleRoutes);

router.use("/customer/vehicles", customerVehicleRoutes);
router.use("/customer/orders", customerOrderRoutes);
router.use("/customer/profile", customerProfileRoutes);

export default router;