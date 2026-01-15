
import { db } from '../config/database'
import { eq } from 'drizzle-orm'
import {
  salesReturnModel,
  salesDetailsModel,
  storeTransactionModel,
} from '../schemas'
import { NewSaleReturn } from '../schemas'

export const createSaleReturn = async (data: NewSaleReturn) => {
  return db.transaction(async (tx) => {
    // 1️⃣ Get sale details (SOURCE OF TRUTH)
    const [saleDetail] = await tx
      .select()
      .from(salesDetailsModel)
      .where(eq(salesDetailsModel.saleDetailsId, data.saleDetailsId))

    if (!saleDetail) {
      throw new Error('Sale detail not found')
    }

    // 2️⃣ Insert into sales_return
    const [ret] = await tx
      .insert(salesReturnModel)
      .values({
        saleDetailsId: data.saleDetailsId,
        returnQuantity: data.returnQuantity,
        createdBy: data.createdBy,
      })
      .$returningId()

    // 3️⃣ Insert store transaction (STOCK INCREASE)
    await tx.insert(storeTransactionModel).values({
      itemId: saleDetail.itemId,
      transactionType: 'sales_return', // exact enum value
      quantity: Math.abs(data.returnQuantity), // positive = stock increase
      createdBy: data.createdBy,
      createdAt: new Date(),
    })

    return ret
  })
}

export const getReturnsBySaleDetail = async (saleDetailsId: number) => {
  return db
    .select()
    .from(salesReturnModel)
    .where(eq(salesReturnModel.saleDetailsId, saleDetailsId))
}

export const deleteSaleReturn = async (id: number) => {
  await db.delete(salesReturnModel).where(eq(salesReturnModel.saleReturnId, id))
}
