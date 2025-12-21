import { Router } from 'express'
import {
  createItemController,
  getAllItemsController,
  getItemController,
  editItemController,
  deleteItemController,
} from '../controllers/items.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createItemController)
router.get('/getAll', authenticateUser, getAllItemsController)
router.get('/get/:id', authenticateUser, getItemController)
router.patch('/update/:id', authenticateUser, editItemController)
router.delete('/delete/:id', authenticateUser, deleteItemController)

export default router
