import { Router } from 'express'
import {
  createSupplierController,
  getAllSuppliersController,
  getSupplierController,
  editSupplierController,
  deleteSupplierController,
} from '../controllers/suppliers.controller'
import { authenticateUser } from '../middlewares/auth.middleware'


const router = Router()

router.post('/create', authenticateUser, createSupplierController)
router.get('/getAll', authenticateUser, getAllSuppliersController)
router.get('/get/:id', authenticateUser, getSupplierController)
router.patch('/update/:id', authenticateUser, editSupplierController)
router.delete('/delete/:id', authenticateUser, deleteSupplierController)

export default router
