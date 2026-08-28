import { Router } from "express";
import {getAllStaff,updateStaffStatus} from '../Controllers/staffControllers';
import { authenticate } from "../Middlewares/authMiddlewares";
import { validate } from "../Middlewares/middlewaresValidation";
import { updateStaffStatusSchema, } from "../Validations/staffValidation";


const router = Router();

router.get ("/", authenticate, getAllStaff);
router.patch ("/:id", authenticate, validate(updateStaffStatusSchema), updateStaffStatus);

export default router;