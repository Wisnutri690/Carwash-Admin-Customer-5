import { Router } from "express";
import *as orderControllers from '../Controllers/orderControllers';
import { authenticate } from "../Middlewares/authMiddlewares";
import { validate } from "../Middlewares/middlewaresValidation";
import { createOrderSchema, updateOrderSchema } from "../Validations/orderValidation"
import { paymentSchema } from "../Validations/paymentValidation";

const router = Router();


router.get ("/", authenticate, orderControllers.getAllOrders);
router.get ('/:id', authenticate, orderControllers.getOrderById);
router.post('/', authenticate, validate(createOrderSchema), orderControllers.createOrder);
router.put('/:id', authenticate, validate(updateOrderSchema), orderControllers.updateOrder);
router.delete('/:id', authenticate, orderControllers.deleteOrder);
router.post('/:id/payment', authenticate, validate(paymentSchema), orderControllers.payOrder);
router.get('/:id/invoice', authenticate, orderControllers.getInvoiceByOrderId);

export default router;