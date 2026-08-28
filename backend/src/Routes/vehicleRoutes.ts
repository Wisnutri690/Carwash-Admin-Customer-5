import { Router } from "express";
import *as vehicleControllers from '../Controllers/vehicleControllers';
import { authenticate } from "../Middlewares/authMiddlewares";
import { validate } from "../Middlewares/middlewaresValidation";
import { createVehicleSchema, updateVehicleSchema, } from "../Validations/vehicleValidation";


const router = Router();

router.get ("/", authenticate, vehicleControllers.getAllVehicles);
router.get ('/:id', authenticate, vehicleControllers.getVehicleById);
router.post ('/', authenticate, validate(createVehicleSchema), vehicleControllers.createVehicle);
router.put ('/:id', authenticate, validate(updateVehicleSchema), vehicleControllers.updateVehicle);
router.delete ('/:id', authenticate, vehicleControllers.deleteVehicle);;

export default router;