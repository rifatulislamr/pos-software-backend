import { Router } from 'express'
import {
  createSaleReturnController,
  getReturnsBySaleController,
  deleteSaleReturnController,
} from '../controllers/sales-return.controller'
import { authenticateUser } from '../middlewares/auth.middleware'


const router = Router()

router.post('/create', authenticateUser, createSaleReturnController)
router.get('/sale/:saleDetailsId', authenticateUser, getReturnsBySaleController)
router.delete('/delete/:id', authenticateUser, deleteSaleReturnController)

export default router
