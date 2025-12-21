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

router.post('/create', createCategoryController)
router.get('/getAll', authenticateUser, getAllCategoriesController)
router.get('get/:id', getCategoryController)
router.put('update/:id', editCategoryController)
router.delete('/:id', deleteCategoryController)

export default router
