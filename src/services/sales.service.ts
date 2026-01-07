import { db } from '../config/database'
import { eq } from 'drizzle-orm'
import {
  salesMasterModel,
  salesDetailsModel,
  NewSaleMaster,
  NewSaleDetails,
} from '../schemas'

export const createSale = async (data: {
  sale: NewSaleMaster
  items: Omit<NewSaleDetails, 'saleMasterId'>[]
  createdBy: number
}) => {
  return db.transaction(async (tx) => {
    const [master] = await tx
      .insert(salesMasterModel)
      .values({ ...data.sale, createdBy: data.createdBy })
      .$returningId()

    await tx.insert(salesDetailsModel).values(
      data.items.map((item) => ({
        ...item,
        saleMasterId: master.saleMasterId,
        createdBy: data.createdBy,
      }))
    )

    return master
  })
}

export const getSaleById = async (id: number) => {
  const sale = await db
    .select()
    .from(salesMasterModel)
    .where(eq(salesMasterModel.saleMasterId, id))
    .limit(1)

  const items = await db
    .select()
    .from(salesDetailsModel)
    .where(eq(salesDetailsModel.saleMasterId, id))

  return { ...sale[0], items }
}

export const getAllSales = async () => {
  return db.select().from(salesMasterModel)
}

export const updateSale = async (
  id: number,
  data: {
    sale?: Partial<NewSaleMaster>
    items?: Omit<NewSaleDetails, 'saleMasterId'>[]
    updatedBy: number
  }
) => {
  return db.transaction(async (tx) => {
    if (data.sale) {
      await tx
        .update(salesMasterModel)
        .set({ ...data.sale, updatedBy: data.updatedBy })
        .where(eq(salesMasterModel.saleMasterId, id))
    }

    if (data.items) {
      await tx
        .delete(salesDetailsModel)
        .where(eq(salesDetailsModel.saleMasterId, id))

      await tx.insert(salesDetailsModel).values(
        data.items.map((item) => ({
          ...item,
          saleMasterId: id,
          createdBy: data.updatedBy,
        }))
      )
    }

    return getSaleById(id)
  })
}

export const deleteSale = async (id: number) => {
  await db
    .delete(salesMasterModel)
    .where(eq(salesMasterModel.saleMasterId, id))
}




// import { db } from '../config/database'
// import { eq } from 'drizzle-orm'
// import { BadRequestError } from './utils/errors.utils'
// import {
//   salesMasterModel,
//   salesDetailsModel,
//   salesReturnModel,
//   NewSaleMaster,
//   NewSaleDetails,
//   NewSaleReturn,
// } from '../schemas'

// // ---------- Create Sale ----------
// export const createSale = async (data: {
//   sale: NewSaleMaster
//   items: Omit<NewSaleDetails, 'saleMasterId'>[]
//   returns?: { saleDetailsId: number; returnQuantity: number }[]
//   createdBy: number
// }) => {
//   return await db.transaction(async (tx) => {
//     // 1️⃣ Insert master sale
//     const [master] = await tx
//       .insert(salesMasterModel)
//       .values({ ...data.sale, createdBy: data.createdBy })
//       .$returningId()

//     const saleMasterId = master.saleMasterId

//     // 2️⃣ Insert sale items
//     await tx.insert(salesDetailsModel).values(
//       data.items.map((item) => ({
//         ...item,
//         saleMasterId,
//         createdBy: data.createdBy,
//         createdAt: new Date(),
//       }))
//     )

//     // 3️⃣ Insert sale returns if provided
//     if (data.returns?.length) {
//       await tx.insert(salesReturnModel).values(
//         data.returns.map((ret) => ({
//           saleDetailsId: ret.saleDetailsId,
//           returnQuantity: ret.returnQuantity,
//           createdBy: data.createdBy,
//           createdAt: new Date(),
//         }))
//       )
//     }

//     return { saleMasterId }
//   })
// }

// // ---------- Get Sale by ID ----------
// export const getSaleById = async (saleMasterId: number) => {
//   const sale = await db
//     .select()
//     .from(salesMasterModel)
//     .where(eq(salesMasterModel.saleMasterId, saleMasterId))
//     .limit(1)

//   if (!sale.length) throw BadRequestError('Sale not found')

//   const items = await db
//     .select()
//     .from(salesDetailsModel)
//     .where(eq(salesDetailsModel.saleMasterId, saleMasterId))

//   // Include returns for each item
//   const itemsWithReturns = await Promise.all(
//     items.map(async (item) => {
//       const returns = await db
//         .select()
//         .from(salesReturnModel)
//         .where(eq(salesReturnModel.saleDetailsId, item.saleDetailsId))
//       return { ...item, returns }
//     })
//   )

//   return { ...sale[0], items: itemsWithReturns }
// }

// // ---------- Get All Sales ----------
// export const getAllSales = async () => {
//   const sales = await db.select().from(salesMasterModel)
//   if (!sales.length) throw BadRequestError('No sales found')
//   return sales
// }

// // ---------- Update Sale ----------
// export const updateSale = async (
//   saleMasterId: number,
//   data: {
//     sale?: Partial<NewSaleMaster>
//     items?: Omit<NewSaleDetails, 'saleMasterId'>[]
//     returns?: { saleDetailsId: number; returnQuantity: number }[]
//     updatedBy?: number
//   }
// ) => {
//   return await db.transaction(async (tx) => {
//     // 1️⃣ Update master sale
//     if (data.sale) {
//       await tx
//         .update(salesMasterModel)
//         .set({ ...data.sale, updatedBy: data.updatedBy, updatedAt: new Date() })
//         .where(eq(salesMasterModel.saleMasterId, saleMasterId))
//     }

//     // 2️⃣ Update items
//     if (data.items) {
//       // Delete old items
//       await tx
//         .delete(salesDetailsModel)
//         .where(eq(salesDetailsModel.saleMasterId, saleMasterId))

//       // Insert new items
//       await tx.insert(salesDetailsModel).values(
//         data.items.map((item) => ({
//           ...item,
//           saleMasterId,
//           createdBy: data.updatedBy || 0,
//           createdAt: new Date(),
//         }))
//       )
//     }

//     // 3️⃣ Update returns (if any)
//     if (data.returns) {
//       // Insert new returns (we do not delete old returns here, adjust if needed)
//       await tx.insert(salesReturnModel).values(
//         data.returns.map((ret) => ({
//           saleDetailsId: ret.saleDetailsId,
//           returnQuantity: ret.returnQuantity,
//           createdBy: data.updatedBy || 0,
//           createdAt: new Date(),
//         }))
//       )
//     }

//     return getSaleById(saleMasterId)
//   })
// }

// // ---------- Delete Sale ----------
// export const deleteSale = async (saleMasterId: number) => {
//   // Ensure sale exists
//   await getSaleById(saleMasterId)

//   // Delete master sale (cascade will delete items & returns)
//   await db
//     .delete(salesMasterModel)
//     .where(eq(salesMasterModel.saleMasterId, saleMasterId))

//   return { message: 'Sale deleted successfully' }
// }
