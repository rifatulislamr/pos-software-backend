import { Router } from 'express'
import {
  createPurchaseOrderController,
  getAllPurchaseOrdersController,
  getPurchaseOrderController,
  updatePurchaseOrderController,
  deletePurchaseOrderController,
} from '../controllers/purchase-orders.controller'
import { authenticateUser } from '../middlewares/auth.middleware'


const router = Router()

router.post('/create', authenticateUser, createPurchaseOrderController)
router.get('/getAll', authenticateUser, getAllPurchaseOrdersController)
router.get('/get/:id', authenticateUser, getPurchaseOrderController)
router.patch('/update/:id', authenticateUser, updatePurchaseOrderController)
router.delete('/delete/:id', authenticateUser, deletePurchaseOrderController)

export default router
