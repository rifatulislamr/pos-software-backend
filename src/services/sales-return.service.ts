import { db } from '../config/database'
import { eq } from 'drizzle-orm'
import { salesReturnModel, NewSaleReturn } from '../schemas'

export const createSaleReturn = async (data: NewSaleReturn) => {
  const [ret] = await db
    .insert(salesReturnModel)
    .values(data)
    .$returningId()

  return ret
}

export const getReturnsBySaleDetail = async (saleDetailsId: number) => {
  return db
    .select()
    .from(salesReturnModel)
    .where(eq(salesReturnModel.saleDetailsId, saleDetailsId))
}

export const deleteSaleReturn = async (id: number) => {
  await db
    .delete(salesReturnModel)
    .where(eq(salesReturnModel.saleReturnId, id))
}
