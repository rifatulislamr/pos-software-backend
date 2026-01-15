import { Request, Response, NextFunction } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
} from '../services/sales.service'

export const createSaleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_sale')

    const userId = req.user?.userId
    if (!userId) throw new Error('Unauthorized')

    const sale = await createSale({
      sale: req.body.sale,
      items: req.body.items,
      createdBy: userId,
    })

    res.status(201).json({ status: 'success', data: sale })
  } catch (err) {
    next(err)
  }
}

export const getAllSalesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_sale')
    res.json({ status: 'success', data: await getAllSales() })
  } catch (err) {
    next(err)
  }
}

export const getSaleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_sale')
    res.json({
      status: 'success',
      data: await getSaleById(Number(req.params.id)),
    })
  } catch (err) {
    next(err)
  }
}

export const updateSaleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_sale')

    const userId = req.user?.userId
    if (!userId) throw new Error('Unauthorized')

    const sale = await updateSale(Number(req.params.id), {
      sale: req.body.sale,
      items: req.body.items,
      updatedBy: userId,
    })

    res.json({ status: 'success', data: sale })
  } catch (err) {
    next(err)
  }
}

export const deleteSaleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_sale')
    await deleteSale(Number(req.params.id))
    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
}
