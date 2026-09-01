import { Router } from "express";
import * as paymentControllers from '../Controllers/paymentControllers';
import { authenticate,requireCustomer } from "../Middlewares/authMiddlewares";

const router = Router();

router.post ('/snap/:id', authenticate, requireCustomer, paymentControllers.createSnapPayment);

router.post("/notification", paymentControllers.handleMidtransNotification);

export default router;