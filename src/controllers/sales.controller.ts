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



// import { Request, Response, NextFunction } from 'express'
// import { createInsertSchema } from 'drizzle-zod'
// import { z } from 'zod'
// import { requirePermission } from '../services/utils/jwt.utils'
// import {
//   salesMasterModel,
//   salesDetailsModel,
//   salesReturnModel,
//   NewSaleDetails,
//   NewSaleReturn,
//   NewSaleMaster,
// } from '../schemas'
// import {
//   createSale,
//   getAllSales,
//   getSaleById,
//   updateSale,
//   deleteSale,
// } from '../services/sales.service'

// // ---------- Schemas ----------

// // Convert saleDate string to Date

// const saleMasterSchema = createInsertSchema(salesMasterModel)
//   .omit({
//     saleMasterId: true,
//     createdAt: true,
//     updatedAt: true,
//     createdBy: true,
//   })
//   .extend({
//     saleDate: z.preprocess((val) => {
//       // val comes in as unknown
//       if (
//         typeof val === 'string' ||
//         typeof val === 'number' ||
//         val instanceof Date
//       ) {
//         return new Date(val)
//       }
//       return val // let Zod handle invalid types
//     }, z.date()),
//   })

// const saleDetailsSchema = createInsertSchema(salesDetailsModel).omit({
//   saleDetailsId: true,
//   saleMasterId: true,
//   createdAt: true,
//   updatedAt: true,
//   createdBy: true,
// })

// const saleReturnSchema = createInsertSchema(salesReturnModel).omit({
//   saleReturnId: true,
//   createdAt: true,
//   updatedAt: true,
//   createdBy: true,
// })

// // Create sale schema
// const createSaleSchema = z.object({
//   sale: saleMasterSchema,
//   items: z.array(saleDetailsSchema).min(1),
//   returns: z.array(saleReturnSchema).optional(),
// })

// // Partial schema for update
// const updateSaleSchema = z.object({
//   sale: saleMasterSchema.partial().optional(),
//   items: z.array(saleDetailsSchema).optional(),
//   returns: z.array(saleReturnSchema).optional(),
// })

// // ---------- Controllers ----------

// export const createSaleController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     requirePermission(req, 'create_sale')

//     // 1️⃣ Validate request
//     const data = createSaleSchema.parse(req.body)

//     const userId = req.user?.userId
//     if (!userId) throw new Error('Unauthorized: user not found')

//     // 2️⃣ Sale
//     const saleWithUser = { ...data.sale, createdBy: userId }

//     // 3️⃣ Items
//     const itemsWithUser = data.items.map((item) => ({
//       ...item,
//       createdBy: userId,
//     }))

//     // 4️⃣ Returns - must match service type
//     const returnsMapped:
//       | { saleDetailsId: number; returnQuantity: number }[]
//       | undefined = data.returns?.map((r) => ({
//       saleDetailsId: r.saleDetailsId,
//       returnQuantity: r.returnQuantity,
//     }))

//     // 5️⃣ Call service
//     const sale = await createSale({
//       sale: saleWithUser,
//       items: itemsWithUser,
//       returns: returnsMapped,
//       createdBy: userId,
//     })

//     res.status(201).json({ status: 'success', data: sale })
//   } catch (error) {
//     next(error)
//   }
// }

// export const getAllSalesController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     requirePermission(req, 'view_sale')
//     const sales = await getAllSales()
//     res.status(200).json({ status: 'success', data: sales })
//   } catch (error) {
//     next(error)
//   }
// }

// export const getSaleController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     requirePermission(req, 'view_sale')
//     const id = Number(req.params.id)
//     const sale = await getSaleById(id)
//     res.status(200).json({ status: 'success', data: sale })
//   } catch (error) {
//     next(error)
//   }
// }

// export const updateSaleController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     requirePermission(req, 'edit_sale')

//     const saleMasterId = Number(req.params.id)
//     const data = updateSaleSchema.parse(req.body)
//     const userId = req.user?.userId
//     if (!userId) throw new Error('Unauthorized: user not found')

//     const updatedItems = data.items?.map((item) => ({
//       ...item,
//       createdBy: userId,
//       updatedBy: userId,
//     }))

//     const updatedReturns = data.returns?.map((r) => ({
//       ...r,
//       createdBy: userId,
//       updatedBy: userId,
//     }))

//     const updatedSale = await updateSale(saleMasterId, {
//       sale: data.sale,
//       items: updatedItems,
//       returns: updatedReturns,
//       updatedBy: userId,
//     })

//     res.status(200).json({ status: 'success', data: updatedSale })
//   } catch (error) {
//     next(error)
//   }
// }

// export const deleteSaleController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     requirePermission(req, 'delete_sale')
//     const id = Number(req.params.id)
//     const result = await deleteSale(id)
//     res.status(200).json({ status: 'success', data: result })
//   } catch (error) {
//     next(error)
//   }
// }
