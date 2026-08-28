import { Router } from "express";
import *as customerControllers from '../Controllers/customerControllers';
import { authenticate } from "../Middlewares/authMiddlewares";
import { validate } from "../Middlewares/middlewaresValidation";
import { createCustomerSchema, updateCustomerSchema, } from "../Validations/customerValidation";

const router = Router();

router.get ("/", authenticate, customerControllers.getAllCustomers);
router.get ('/:id', authenticate, customerControllers.getCustomerById);
router.post ('/', authenticate, validate(createCustomerSchema), customerControllers.createCustomer);
router.put ('/:id', authenticate, validate(updateCustomerSchema), customerControllers.updateCustomer);
router.delete ('/:id', authenticate, customerControllers.deleteCustomer);;

export default router;