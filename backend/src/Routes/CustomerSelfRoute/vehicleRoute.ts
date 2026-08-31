import { Router } from "express";
import * as vehicleControllers from "../../Controllers/CustomerSelfControllers/vehicleControllers";
import { authenticate, requireCustomer } from "../../Middlewares/authMiddlewares";
import { validate } from "../../Middlewares/middlewaresValidation";
import { customerAddVehicleSchema } from "../../Validations/CustomerSelfValidations/customerSelfServiceValidation";

const router = Router();

router.use(authenticate, requireCustomer);

router.get("/", vehicleControllers.getMyVehicles);
router.post("/", validate(customerAddVehicleSchema), vehicleControllers.addMyVehicle);
router.put("/:id", vehicleControllers.updateMyVehicle);
router.delete("/:id", vehicleControllers.deleteMyVehicle);

export default router;