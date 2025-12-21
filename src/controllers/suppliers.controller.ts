import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { requirePermission } from '../services/utils/jwt.utils'
import { supplierModel } from '../schemas'

import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '../services/suppliers.service'
const createSupplierSchema = createInsertSchema(supplierModel)
const editSupplierSchema = createSupplierSchema
  .omit({
    supplierId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: createSupplierSchema.shape.name.optional(),
    email: createSupplierSchema.shape.email.optional(),
  })

export const createSupplierController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_supplier')
    const supplierData = createSupplierSchema.parse(req.body)
    const supplier = await createSupplier(supplierData)

    res.status(201).json({
      status: 'success',
      data: { supplier },
    })
  } catch (error) {
    next(error)
  }
}

export const getAllSuppliersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_supplier')
    const suppliers = await getAllSuppliers()
    res.status(200).json(suppliers)
  } catch (error) {
    next(error)
  }
}

export const getSupplierController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_supplier')
    const id: number = Number(req.params.id)
    const supplier = await getSupplierById(id)
    res.status(200).json(supplier)
  } catch (error) {
    next(error)
  }
}

export const editSupplierController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_supplier')
    const id: number = Number(req.params.id)
    const supplierData = editSupplierSchema.parse(req.body)
    const supplier = await updateSupplier(id, supplierData)
    res.status(200).json(supplier)
  } catch (error) {
    next(error)
  }
}

export const deleteSupplierController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_supplier')
    const id: number = Number(req.params.id)
    const result = await deleteSupplier(id)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
