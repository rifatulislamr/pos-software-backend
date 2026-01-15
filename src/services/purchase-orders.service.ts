import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { BadRequestError } from './utils/errors.utils'
import {
  purchaseOrderModel,
  purchaseOrderItemModel,
  purchaseOrderAdditionalCostModel,
  storeTransactionModel,
  NewPurchaseOrder,
  NewPurchaseOrderItem,
  NewPurchaseOrderAdditionalCost,
  itemModel,
} from '../schemas'


/* ----------------------------------------------------
   Utility: Merge items by itemId (KEY REQUIREMENT)
----------------------------------------------------- */
const normalizeItems = (
  items: Omit<NewPurchaseOrderItem, 'purchaseOrderId'>[]
): Omit<NewPurchaseOrderItem, 'purchaseOrderId'>[] => {
  const map = new Map<number, Omit<NewPurchaseOrderItem, 'purchaseOrderId'>>()

  for (const item of items) {
    const existing = map.get(item.itemId)

    if (!existing) {
      map.set(item.itemId, { ...item })
      continue
    }

    const totalQty = existing.quantity + item.quantity

    const avgCost =
      existing.purchaseCost && item.purchaseCost
        ? (
            (existing.quantity * Number(existing.purchaseCost) +
              item.quantity * Number(item.purchaseCost)) /
            totalQty
          ).toFixed(2) // converts to string with 2 decimals
        : (existing.purchaseCost ?? item.purchaseCost?.toString())
    map.set(item.itemId, {
      ...existing,
      quantity: totalQty,
      purchaseCost: item.purchaseCost?.toString() ?? null,
    })
  }

  return Array.from(map.values())
}

/* ----------------------------------------------------
   Create Purchase Order
----------------------------------------------------- */
export const createPurchaseOrder = async (data: {
  order: NewPurchaseOrder
  items: Omit<NewPurchaseOrderItem, 'purchaseOrderId'>[]
  additionalCosts?: Omit<NewPurchaseOrderAdditionalCost, 'purchaseOrderId'>[]
  createdBy: number
}) => {
  return await db.transaction(async (tx) => {
    // 0️⃣ Normalize items (merge same itemId)
    const items = normalizeItems(data.items)

    // 1️⃣ Insert purchase order
    const [po] = await tx
      .insert(purchaseOrderModel)
      .values(data.order)
      .$returningId()

    const purchaseOrderId = po.purchaseOrderId

    // 2️⃣ Insert purchase order items
    await tx.insert(purchaseOrderItemModel).values(
      items.map((item) => ({
        ...item,
        purchaseOrderId,
      }))
    )

    // 3️⃣ Insert additional costs (optional)
    if (data.additionalCosts?.length) {
      await tx.insert(purchaseOrderAdditionalCostModel).values(
        data.additionalCosts.map((cost) => ({
          ...cost,
          purchaseOrderId,
        }))
      )
    }

    // 4️⃣ Insert store transactions (STRICT ENUM FIX APPLIED)
    await tx.insert(storeTransactionModel).values(
      items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        purchaseCost: item.purchaseCost ?? null,
        transactionType: 'purchase' as const, // ✅ enum-safe
        purchaseOrderId,
        createdBy: data.createdBy,
        createdAt: new Date(),
      }))
    )

    // // item model increase stock quantity
    // for (const item of items) {
    //   await tx
    //     .update(itemModel)
    //     .set({
    //       inStock: sql`${itemModel.inStock} + ${item.quantity}`,
    //     })
    //     .where(eq(itemModel.itemId, item.itemId))
    // }

    return { purchaseOrderId }
  })
}

/* ----------------------------------------------------
   Get Purchase Order by ID
----------------------------------------------------- */
export const getPurchaseOrderById = async (purchaseOrderId: number) => {
  const order = await db
    .select()
    .from(purchaseOrderModel)
    .where(eq(purchaseOrderModel.purchaseOrderId, purchaseOrderId))
    .limit(1)

  if (!order.length) {
    throw BadRequestError('Purchase order not found')
  }

  const items = await db
    .select()
    .from(purchaseOrderItemModel)
    .where(eq(purchaseOrderItemModel.purchaseOrderId, purchaseOrderId))

  const additionalCosts = await db
    .select()
    .from(purchaseOrderAdditionalCostModel)
    .where(
      eq(purchaseOrderAdditionalCostModel.purchaseOrderId, purchaseOrderId)
    )

  return {
    ...order[0],
    items,
    additionalCosts,
  }
}

/* ----------------------------------------------------
   Get All Purchase Orders
----------------------------------------------------- */
export const getAllPurchaseOrders = async () => {
  const orders = await db.select().from(purchaseOrderModel)

  if (!orders.length) {
    throw BadRequestError('No purchase orders found')
  }

  return orders
}

/* ----------------------------------------------------
   Update Purchase Order
   (NOTE: Transaction reversal intentionally excluded)
----------------------------------------------------- */
export const updatePurchaseOrder = async (
  purchaseOrderId: number,
  data: {
    order?: Partial<NewPurchaseOrder>
    items?: Omit<NewPurchaseOrderItem, 'purchaseOrderId'>[]
    additionalCosts?: Omit<NewPurchaseOrderAdditionalCost, 'purchaseOrderId'>[]
  }
) => {
  return await db.transaction(async (tx) => {
    // 1️⃣ Update PO header
    if (data.order) {
      await tx
        .update(purchaseOrderModel)
        .set(data.order)
        .where(eq(purchaseOrderModel.purchaseOrderId, purchaseOrderId))
    }

    // 2️⃣ Update items
    if (data.items) {
      const items = normalizeItems(data.items)

      await tx
        .delete(purchaseOrderItemModel)
        .where(eq(purchaseOrderItemModel.purchaseOrderId, purchaseOrderId))

      await tx.insert(purchaseOrderItemModel).values(
        items.map((item) => ({
          ...item,
          purchaseOrderId,
        }))
      )
    }

    // 3️⃣ Update additional costs
    if (data.additionalCosts) {
      await tx
        .delete(purchaseOrderAdditionalCostModel)
        .where(
          eq(purchaseOrderAdditionalCostModel.purchaseOrderId, purchaseOrderId)
        )

      await tx.insert(purchaseOrderAdditionalCostModel).values(
        data.additionalCosts.map((cost) => ({
          ...cost,
          purchaseOrderId,
        }))
      )
    }

    return getPurchaseOrderById(purchaseOrderId)
  })
}

/* ----------------------------------------------------
   Delete Purchase Order
----------------------------------------------------- */
export const deletePurchaseOrder = async (purchaseOrderId: number) => {
  // Validate existence
  await getPurchaseOrderById(purchaseOrderId)

  await db
    .delete(purchaseOrderModel)
    .where(eq(purchaseOrderModel.purchaseOrderId, purchaseOrderId))

  return { message: 'Purchase order deleted successfully' }
}

// import { eq } from 'drizzle-orm'
// import { db } from '../config/database'
// import { BadRequestError } from './utils/errors.utils'
// import {
//   purchaseOrderModel,
//   purchaseOrderItemModel,
//   purchaseOrderAdditionalCostModel,
//   NewPurchaseOrder,
//   NewPurchaseOrderItem,
//   NewPurchaseOrderAdditionalCost,
//   storeTransactionModel,
// } from '../schemas'

// // ---------- Create ----------

// export const createPurchaseOrder = async (data: {
//   order: NewPurchaseOrder
//   items: Omit<NewPurchaseOrderItem, 'purchaseOrderId'>[]
//   additionalCosts?: Omit<NewPurchaseOrderAdditionalCost, 'purchaseOrderId'>[]
//   createdBy: number
// }) => {
//   return await db.transaction(async (tx) => {
//     // 1️⃣ Insert purchase order
//     const [po] = await tx
//       .insert(purchaseOrderModel)
//       .values(data.order)
//       .$returningId()

//     const purchaseOrderId = po.purchaseOrderId

//     // 2️⃣ Insert purchase order items
//     await tx.insert(purchaseOrderItemModel).values(
//       data.items.map((item) => ({
//         ...item,
//         purchaseOrderId,
//       }))
//     )

//     // 3️⃣ Insert additional costs (optional)
//     if (data.additionalCosts?.length) {
//       await tx.insert(purchaseOrderAdditionalCostModel).values(
//         data.additionalCosts.map((cost) => ({
//           ...cost,
//           purchaseOrderId,
//         }))
//       )
//     }

//     // 4️⃣ Insert into store transactions
//     const transactions = data.items.map((item) => ({
//       itemId: item.itemId,
//       quantity: item.quantity,
//       purchaseCost: item.purchaseCost,
//       transactionType: 'purchase' as const,
//       purchaseOrderId,
//       createdBy: data.createdBy,
//       createdAt: new Date(),
//     }))

//     await tx.insert(storeTransactionModel).values(transactions)

//     return { purchaseOrderId }
//   })
// }

// // ---------- Get by ID ----------
// export const getPurchaseOrderById = async (purchaseOrderId: number) => {
//   const order = await db
//     .select()
//     .from(purchaseOrderModel)
//     .where(eq(purchaseOrderModel.purchaseOrderId, purchaseOrderId))
//     .limit(1)

//   if (!order.length) {
//     throw BadRequestError('Purchase order not found')
//   }

//   const items = await db
//     .select()
//     .from(purchaseOrderItemModel)
//     .where(eq(purchaseOrderItemModel.purchaseOrderId, purchaseOrderId))

//   const additionalCosts = await db
//     .select()
//     .from(purchaseOrderAdditionalCostModel)
//     .where(
//       eq(purchaseOrderAdditionalCostModel.purchaseOrderId, purchaseOrderId)
//     )

//   return {
//     ...order[0],
//     items,
//     additionalCosts,
//   }
// }

// // ---------- Get All ----------
// export const getAllPurchaseOrders = async () => {
//   const orders = await db.select().from(purchaseOrderModel)

//   if (!orders.length) {
//     throw BadRequestError('No purchase orders found')
//   }

//   return orders
// }

// // ---------- Update Purchase Order ----------
// export const updatePurchaseOrder = async (
//   purchaseOrderId: number,
//   data: {
//     order?: Partial<NewPurchaseOrder>
//     items?: Omit<NewPurchaseOrderItem, 'purchaseOrderId'>[]
//     additionalCosts?: Omit<NewPurchaseOrderAdditionalCost, 'purchaseOrderId'>[]
//   }
// ) => {
//   return await db.transaction(async (tx) => {
//     // 1️⃣ Update parent order
//     if (data.order) {
//       await tx
//         .update(purchaseOrderModel)
//         .set(data.order)
//         .where(eq(purchaseOrderModel.purchaseOrderId, purchaseOrderId))
//     }

//     // 2️⃣ Update items
//     if (data.items) {
//       // Delete old items
//       await tx
//         .delete(purchaseOrderItemModel)
//         .where(eq(purchaseOrderItemModel.purchaseOrderId, purchaseOrderId))

//       // Insert new items
//       await tx.insert(purchaseOrderItemModel).values(
//         data.items.map((item) => ({
//           ...item,
//           purchaseOrderId,
//         }))
//       )
//     }

//     // 3️⃣ Update additional costs
//     if (data.additionalCosts) {
//       await tx
//         .delete(purchaseOrderAdditionalCostModel)
//         .where(
//           eq(purchaseOrderAdditionalCostModel.purchaseOrderId, purchaseOrderId)
//         )

//       await tx.insert(purchaseOrderAdditionalCostModel).values(
//         data.additionalCosts.map((cost) => ({
//           ...cost,
//           purchaseOrderId,
//         }))
//       )
//     }

//     // 4️⃣ Return updated PO with items and additionalCosts
//     const order = await tx
//       .select()
//       .from(purchaseOrderModel)
//       .where(eq(purchaseOrderModel.purchaseOrderId, purchaseOrderId))
//       .limit(1)

//     if (!order.length) {
//       throw BadRequestError('Purchase order not found')
//     }

//     const items = await tx
//       .select()
//       .from(purchaseOrderItemModel)
//       .where(eq(purchaseOrderItemModel.purchaseOrderId, purchaseOrderId))

//     const additionalCosts = await tx
//       .select()
//       .from(purchaseOrderAdditionalCostModel)
//       .where(
//         eq(purchaseOrderAdditionalCostModel.purchaseOrderId, purchaseOrderId)
//       )

//     return {
//       ...order[0],
//       items,
//       additionalCosts,
//     }
//   })
// }

// // ---------- Delete ----------
// export const deletePurchaseOrder = async (purchaseOrderId: number) => {
//   await getPurchaseOrderById(purchaseOrderId)

//   await db
//     .delete(purchaseOrderModel)
//     .where(eq(purchaseOrderModel.purchaseOrderId, purchaseOrderId))

//   return { message: 'Purchase order deleted successfully' }
// }
