import { Router } from "express";
import *as serviceControllers from '../Controllers/serviceControllers'
import { authenticate } from "../Middlewares/authMiddlewares";
import { validate } from "../Middlewares/middlewaresValidation";
import { createServiceSchema, updateServiceSchema, } from "../Validations/serviceValidation";

const router = Router();

router.get ("/", authenticate, serviceControllers.getAllServices);
router.get ('/:id', authenticate, serviceControllers.getServicesById);
router.post ('/', authenticate, validate(createServiceSchema), serviceControllers.createServices);
router.put ('/:id', authenticate, validate(updateServiceSchema), serviceControllers.updateServices);
router.delete ('/:id', authenticate, serviceControllers.deleteServices);;

export default router;