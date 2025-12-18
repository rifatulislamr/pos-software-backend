import { Router } from "express";
import authRoutes from "./auth.routes";
import categorieRoutes from "./categories.routes"
const router=Router()

router.use('/auth',authRoutes)
router.use("/categories",categorieRoutes);

export default router;