import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'

import { requirePermission } from '../services/utils/jwt.utils'
import { categoryModel } from '../schemas'
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../services/categories.service'

const createCategorySchema = createInsertSchema(categoryModel)
const editCategorySchema = createCategorySchema
  .omit({
    categoryId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: createCategorySchema.shape.name.optional(),
    color: createCategorySchema.shape.color.optional(),
  })

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create category')
    const categoryData = createCategorySchema.parse(req.body)
    const category = await createCategory(categoryData)

    res.status(201).json({
      status: 'success',
      data: { category },
    })
  } catch (error) {
    next(error)
  }
}

export const getAllCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_category')
    const categories = await getAllCategories()

    res.status(200).json(categories)
  } catch (error) {
    next(error)
  }
}

export const getCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view category')
    const id: number = Number(req.params.id)
    const category = await getCategoryById(id)

    res.status(200).json(category)
  } catch (error) {
    next(error)
  }
}

export const editCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit category')
    const id: number = Number(req.params.id)
    const categoryData = editCategorySchema.parse(req.body)
    const category = await updateCategory(id, categoryData)

    res.status(200).json(category)
  } catch (error) {
    next(error)
  }
}

export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete category')
    const id: number = Number(req.params.id)
    const result = await deleteCategory(id)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
