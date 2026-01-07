import { Router } from 'express'
import {
  createSaleController,
  getAllSalesController,
  getSaleController,
  updateSaleController,
  deleteSaleController,
} from '../controllers/sales.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createSaleController)
router.get('/getall', authenticateUser, getAllSalesController)
router.get('/get:id', authenticateUser, getSaleController)
router.patch('/update/:id', authenticateUser, updateSaleController)
router.delete('/delete/:id', authenticateUser, deleteSaleController)

export default router



// import { Router } from 'express'
// import {
//   createSaleController,
//   getAllSalesController,
//   getSaleController,
//   updateSaleController,
//   deleteSaleController,
// } from '../controllers/sales.controller'
// import { authenticateUser } from '../middlewares/auth.middleware'


// const router = Router()

// router.post('/create', authenticateUser, createSaleController)
// router.get('/getAll', authenticateUser, getAllSalesController)
// router.get('/get/:id', authenticateUser, getSaleController)
// router.patch('/update/:id', authenticateUser, updateSaleController)
// router.delete('/delete/:id', authenticateUser, deleteSaleController)

// export default router
