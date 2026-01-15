import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  purchaseOrderModel,
  purchaseOrderItemModel,
  purchaseOrderAdditionalCostModel,
} from '../schemas'
import {
  createPurchaseOrder,
  
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getAllPurchaseOrdersWithDetails,
} from '../services/purchase-orders.service'

// ---------- Schemas ----------

const purchaseOrderSchema = createInsertSchema(purchaseOrderModel).omit({
  purchaseOrderId: true,
  createdAt: true,
  updatedAt: true,
})

const purchaseOrderItemSchema = createInsertSchema(purchaseOrderItemModel).omit(
  {
    poItemId: true,
    purchaseOrderId: true,
  }
)

const additionalCostSchema = createInsertSchema(
  purchaseOrderAdditionalCostModel
).omit({
  costId: true,
  purchaseOrderId: true,
})

const createPOSchema = z.object({
  order: purchaseOrderSchema,
  items: z.array(purchaseOrderItemSchema).min(1),
  additionalCosts: z.array(additionalCostSchema).optional(),
})

// ---------- Controllers ----------

export const createPurchaseOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_purchase_order')

    const data = createPOSchema.parse(req.body)

    const userId = req.user?.userId
    if (!userId) throw new Error('Unauthorized')

    const result = await createPurchaseOrder({
      ...data,
      createdBy: userId,
    })

    res.status(201).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllPurchaseOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_purchase_order')
    const orders = await getAllPurchaseOrdersWithDetails()
    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
}

export const getPurchaseOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_purchase_order')
    const id = Number(req.params.id)
    const order = await getPurchaseOrderById(id)
    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
}

const updatePOSchema = z.object({
  order: purchaseOrderSchema.partial(),
  items: z.array(purchaseOrderItemSchema).optional(),
  additionalCosts: z.array(additionalCostSchema).optional(),
})

export const updatePurchaseOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_purchase_order')

    const purchaseOrderId = Number(req.params.id)
    const data = updatePOSchema.parse(req.body)

    const updated = await updatePurchaseOrder(purchaseOrderId, data)

    res.status(200).json({
      status: 'success',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

export const deletePurchaseOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_purchase_order')
    const id = Number(req.params.id)

    const result = await deletePurchaseOrder(id)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
