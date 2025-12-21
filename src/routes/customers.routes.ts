import { Router } from 'express'
import {
  createCustomerController,
  getAllCustomersController,
  getCustomerController,
  editCustomerController,
  deleteCustomerController,
} from '../controllers/customers.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createCustomerController)
router.get('/getAll', authenticateUser, getAllCustomersController)
router.get('/get/:id', authenticateUser, getCustomerController)
router.patch('/update/:id', authenticateUser, editCustomerController)
router.delete('/delete/:id', authenticateUser, deleteCustomerController)

export default router
