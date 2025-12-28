import { Router } from 'express'
import {
  createStoreController,
  getAllStoresController,
  getStoreController,
  editStoreController,
  deleteStoreController,
} from '../controllers/stores.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createStoreController)
router.get('/getAll', authenticateUser, getAllStoresController)
router.get('/get/:id', authenticateUser, getStoreController)
router.patch('/update/:id', authenticateUser, editStoreController)
router.delete('/delete/:id', authenticateUser, deleteStoreController)

export default router
