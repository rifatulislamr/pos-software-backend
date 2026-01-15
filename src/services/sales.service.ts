import { db } from '../config/database'
import { eq } from 'drizzle-orm'
import {
  salesMasterModel,
  salesDetailsModel,
  storeTransactionModel,
  salesTransactionModel,
  NewSaleMaster,
  NewSaleDetails,
} from '../schemas'

export const createSale = async (data: {
  sale: NewSaleMaster
  items: Omit<NewSaleDetails, 'saleMasterId'>[]
  createdBy: number
}) => {
  return db.transaction(async (tx) => {
    // 1️⃣ Insert sale master
    const [master] = await tx
      .insert(salesMasterModel)
      .values({ ...data.sale, createdBy: data.createdBy })
      .$returningId()

    // 2️⃣ Insert sale details
    await tx.insert(salesDetailsModel).values(
      data.items.map((item) => ({
        ...item,
        saleMasterId: master.saleMasterId,
        createdBy: data.createdBy,
      }))
    )

    // 3️⃣ Update store transactions (reduce stock)
    await tx.insert(storeTransactionModel).values(
      data.items.map((item) => ({
        itemId: item.itemId,
        quantity: -Math.abs(item.quantity), // reduce stock
        transactionType: 'sale' as const,
        saleMasterId: master.saleMasterId,
        createdBy: data.createdBy,
        createdAt: new Date(),
      }))
    )

    // 4️⃣ Insert into sales_transaction
    const totalAmount = data.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * Number(item.quantity),
      0
    )

    await tx.insert(salesTransactionModel).values({
      saleMasterId: master.saleMasterId,
      customerId: data.sale.customerId,
      amount: totalAmount.toString(),
      transactionDate: new Date(),
      referenceType: 'sales',
      createdBy: data.createdBy,
      createdAt: new Date(),
    })

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
  await db.delete(salesMasterModel).where(eq(salesMasterModel.saleMasterId, id))
}
