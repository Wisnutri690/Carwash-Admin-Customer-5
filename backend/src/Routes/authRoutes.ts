import { Router } from "express";
import *as authController from '../Controllers/authControllers';
import { validate } from "../Middlewares/middlewaresValidation";
import { loginSchema, customerLoginSchema, customerRegisterSchema, } from "../Validations/authValidation";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);

router.post( "/customer/login", validate(customerLoginSchema),authController.customerLogin );
router.post( "/customer/register", validate(customerRegisterSchema), authController.customerRegister);

export default router;