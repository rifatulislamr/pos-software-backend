import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { requirePermission } from '../services/utils/jwt.utils'
import { customerModel } from '../schemas'
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../services/customers.service'

const createCustomerSchema = createInsertSchema(customerModel)
const editCustomerSchema = createCustomerSchema
  .omit({
    customerId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: createCustomerSchema.shape.name.optional(),
    email: createCustomerSchema.shape.email.optional(),
  })

export const createCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_customer')
    const customerData = createCustomerSchema.parse(req.body)
    const customer = await createCustomer(customerData)

    res.status(201).json({
      status: 'success',
      data: { customer },
    })
  } catch (error) {
    next(error)
  }
}

export const getAllCustomersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_customer')
    const customers = await getAllCustomers()
    res.status(200).json(customers)
  } catch (error) {
    next(error)
  }
}

export const getCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_customer')
    const id: number = Number(req.params.id)
    const customer = await getCustomerById(id)
    res.status(200).json(customer)
  } catch (error) {
    next(error)
  }
}

export const editCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_customer')
    const id: number = Number(req.params.id)
    const customerData = editCustomerSchema.parse(req.body)
    const customer = await updateCustomer(id, customerData)
    res.status(200).json(customer)
  } catch (error) {
    next(error)
  }
}

export const deleteCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_customer')
    const id: number = Number(req.params.id)
    const result = await deleteCustomer(id)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
