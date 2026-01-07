import { Router } from "express";
import authRoutes from "./auth.routes";
import categorieRoutes from "./categories.routes"
import itemsRoutes from "./items.routes"
import customersRoutes from "./customers.routes"
import supplierRoutes from "./suppliers.routes"
import purchaseOrderRoutes  from "./purchase-orders.route"
import storeRoutes from "./stores.routes"
import salesRoutes from "./sales.routes"
import salesReturnRoutes from "./sales-return.route"
const router=Router()

router.use('/auth',authRoutes)
router.use("/categories",categorieRoutes)
router.use("/items", itemsRoutes)
router.use("/customers", customersRoutes)
router.use("/supplier", supplierRoutes)
router.use("/purchaseOrder", purchaseOrderRoutes)
router.use("/stores", storeRoutes)
router.use('/sales', salesRoutes);
router.use('/sales-return', salesReturnRoutes);



export default router;