import { Request, Response, NextFunction } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'

import {
  createSaleReturn,
  getReturnsBySaleDetail,
  deleteSaleReturn,
} from '../services/sales-return.service'

export const createSaleReturnController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_sale_return')

    const userId = req.user?.userId
    if (!userId) throw new Error('Unauthorized')

    const result = await createSaleReturn({
      ...req.body,
      createdBy: userId,
    })

    res.status(201).json({ status: 'success', data: result })
  } catch (err) {
    next(err)
  }
}

export const getReturnsBySaleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_sale_return')
    res.json({
      status: 'success',
      data: await getReturnsBySaleDetail(Number(req.params.saleDetailsId)),
    })
  } catch (err) {
    next(err)
  }
}

export const deleteSaleReturnController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_sale_return')
    await deleteSaleReturn(Number(req.params.id))
    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
}
