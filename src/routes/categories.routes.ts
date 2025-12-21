import { Router } from 'express'
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryController,
  editCategoryController,
  deleteCategoryController,
} from '../controllers/categories.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create',authenticateUser, createCategoryController)
router.get('/getAll', authenticateUser, getAllCategoriesController)
router.get('/get/:id',authenticateUser, getCategoryController)
router.patch('/update/:id',authenticateUser, editCategoryController)
router.delete('/delete/:id',authenticateUser, deleteCategoryController)

export default router
