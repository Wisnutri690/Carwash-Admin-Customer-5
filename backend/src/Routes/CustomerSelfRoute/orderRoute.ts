import { Router } from "express";
import * as orderControllers from "../../Controllers/CustomerSelfControllers/orderControllers";
import { authenticate, requireCustomer } from "../../Middlewares/authMiddlewares";
import { validate } from "../../Middlewares/middlewaresValidation";
import { customerCreateOrderSchema } from "../../Validations/CustomerSelfValidations/customerSelfServiceValidation";

const router = Router();

router.use(authenticate, requireCustomer);

router.post( "/", validate(customerCreateOrderSchema), orderControllers.createOrder);

router.get("/active", orderControllers.getMyActiveOrders);

router.get("/history", orderControllers.getMyOrderHistory);

router.patch("/:id/cancel", orderControllers.cancelMyOrder);

export default router;
