import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'

import { requirePermission } from '../services/utils/jwt.utils'
import { storeModel } from '../schemas'
import {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
} from '../services/stores.service'

const createStoreSchema = createInsertSchema(storeModel)

const editStoreSchema = createStoreSchema
  .omit({
    storeId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial()

export const createStoreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_store')
    const storeData = createStoreSchema.parse(req.body)
    const store = await createStore(storeData)

    res.status(201).json({
      status: 'success',
      data: { store },
    })
  } catch (error) {
    next(error)
  }
}

export const getAllStoresController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_store')
    const stores = await getAllStores()

    res.status(200).json(stores)
  } catch (error) {
    next(error)
  }
}

export const getStoreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_store')
    const id = Number(req.params.id)
    const store = await getStoreById(id)

    res.status(200).json(store)
  } catch (error) {
    next(error)
  }
}

export const editStoreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_store')
    const id = Number(req.params.id)
    const storeData = editStoreSchema.parse(req.body)
    const store = await updateStore(id, storeData)

    res.status(200).json(store)
  } catch (error) {
    next(error)
  }
}

export const deleteStoreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_store')
    const id = Number(req.params.id)
    const result = await deleteStore(id)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
