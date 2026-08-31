import { Router } from "express";
import * as profileControllers from "../../Controllers/CustomerSelfControllers/profileControllers";
import { authenticate, requireCustomer } from "../../Middlewares/authMiddlewares";

const router = Router();

router.use(authenticate, requireCustomer);

router.get("/", profileControllers.getMyProfile);
router.put("/", profileControllers.updateMyProfile);

export default router;
