import { Router } from "express";
import *as authController from '../Controllers/authControllers';

const router = Router();

router.post ("/login", authController.login);

export default router;