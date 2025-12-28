import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { BadRequestError } from './utils/errors.utils'
import { storeModel, NewStore } from '../schemas'

// Create store
export const createStore = async (storeData: NewStore) => {
  const [newStore] = await db
    .insert(storeModel)
    .values(storeData)
    .$returningId()

  return newStore
}

// Get store by ID
export const getStoreById = async (storeId: number) => {
  const store = await db
    .select()
    .from(storeModel)
    .where(eq(storeModel.storeId, storeId))
    .limit(1)

  if (!store.length) {
    throw BadRequestError('Store not found')
  }

  return store[0]
}

// Get all stores
export const getAllStores = async () => {
  const stores = await db.select().from(storeModel)

  if (!stores.length) {
    throw BadRequestError('No stores found')
  }

  return stores
}

// Update store
export const updateStore = async (
  storeId: number,
  storeData: Partial<NewStore>
) => {
  await getStoreById(storeId)

  const [updatedStore] = await db
    .update(storeModel)
    .set(storeData)
    .where(eq(storeModel.storeId, storeId))

  return updatedStore
}

// Delete store
export const deleteStore = async (storeId: number) => {
  await getStoreById(storeId)

  await db.delete(storeModel).where(eq(storeModel.storeId, storeId))

  return { message: 'Store deleted successfully' }
}
