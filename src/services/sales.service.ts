import { db } from '../config/database'
import { eq, inArray } from 'drizzle-orm'
import {
  salesMasterModel,
  salesDetailsModel,
  storeTransactionModel,
  salesTransactionModel,
  NewSaleMaster,
  NewSaleDetails,
  customerModel,
  itemModel,
} from '../schemas'


//create sale with its items
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

//get all sales with their details

// export const getAllSales = async () => {
//   // 1. Fetch all sales master records
//   const salesMasters = await db
//     .select()
//     .from(salesMasterModel)

//   if (!salesMasters.length) {
//     return []
//   }

//   // 2. Extract master IDs
//   const saleMasterIds = salesMasters.map(
//     (sale) => sale.saleMasterId
//   )

//   // 3. Fetch all related sale details
//   const salesDetails = await db
//     .select()
//     .from(salesDetailsModel)
//     .where(
//       inArray(
//         salesDetailsModel.saleMasterId,
//         saleMasterIds
//       )
//     )

//   // 4. Attach details to each master
//   const result = salesMasters.map((sale) => ({
//     ...sale,
//     Details: salesDetails.filter(
//       (detail) =>
//         detail.saleMasterId === sale.saleMasterId
//     ),
//   }))

//   return result
// }





export const getAllSales = async () => {
  /* -------------------------------------------------
   * 1. Fetch sales masters with customer name
   * ------------------------------------------------- */
  const salesMasters = await db
    .select({
      saleMasterId: salesMasterModel.saleMasterId,
      paymentType: salesMasterModel.paymentType,
      customerId: salesMasterModel.customerId,
      saleDate: salesMasterModel.saleDate,
      totalQuantity: salesMasterModel.totalQuantity,
      totalAmount: salesMasterModel.totalAmount,
      discountAmount: salesMasterModel.discountAmount,
      notes: salesMasterModel.notes,
      createdBy: salesMasterModel.createdBy,
      createdAt: salesMasterModel.createdAt,
      updatedBy: salesMasterModel.updatedBy,
      updatedAt: salesMasterModel.updatedAt,

      customerName: customerModel.name,
    })
    .from(salesMasterModel)
    .leftJoin(
      customerModel,
      eq(salesMasterModel.customerId, customerModel.customerId)
    )

  if (!salesMasters.length) {
    return []
  }

  /* -------------------------------------------------
   * 2. Collect master IDs
   * ------------------------------------------------- */
  const saleMasterIds = salesMasters.map(
    (sale) => sale.saleMasterId
  )

  /* -------------------------------------------------
   * 3. Fetch sale details with item name
   * ------------------------------------------------- */
  const salesDetails = await db
    .select({
      saleDetailsId: salesDetailsModel.saleDetailsId,
      saleMasterId: salesDetailsModel.saleMasterId,
      itemId: salesDetailsModel.itemId,
      itemName: itemModel.name,
      avgPrice: salesDetailsModel.avgPrice,
      quantity: salesDetailsModel.quantity,
      amount: salesDetailsModel.amount,
      unitPrice: salesDetailsModel.unitPrice,
      createdBy: salesDetailsModel.createdBy,
      createdAt: salesDetailsModel.createdAt,
      updatedBy: salesDetailsModel.updatedBy,
      updatedAt: salesDetailsModel.updatedAt,
    })
    .from(salesDetailsModel)
    .leftJoin(
      itemModel,
      eq(salesDetailsModel.itemId, itemModel.itemId)
    )
    .where(
      inArray(
        salesDetailsModel.saleMasterId,
        saleMasterIds
      )
    )

  /* -------------------------------------------------
   * 4. Group details by master ID (O(n))
   * ------------------------------------------------- */
  const detailsMap = new Map<number, any[]>()

  for (const detail of salesDetails) {
    if (!detailsMap.has(detail.saleMasterId)) {
      detailsMap.set(detail.saleMasterId, [])
    }
    detailsMap.get(detail.saleMasterId)!.push(detail)
  }

  /* -------------------------------------------------
   * 5. Attach details to masters
   * ------------------------------------------------- */
  const result = salesMasters.map((sale) => ({
    ...sale,
    Details: detailsMap.get(sale.saleMasterId) ?? [],
  }))

  return result
}




// update sale and its items

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


// delete sale by id
export const deleteSale = async (id: number) => {
  await db.delete(salesMasterModel).where(eq(salesMasterModel.saleMasterId, id))
}
