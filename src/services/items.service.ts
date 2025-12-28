import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { BadRequestError } from './utils/errors.utils'
import { categoryModel, itemModel, NewItem } from '../schemas'

// Create a new item
export const createItem = async (itemData: NewItem) => {
  try {
    const [newItem] = await db.insert(itemModel).values(itemData).$returningId()
    return newItem
  } catch (error) {
    throw error
  }
}

// Get item by ID
export const getItemById = async (itemId: number) => {
  const item = await db
    .select()
    .from(itemModel)
    .where(eq(itemModel.itemId, itemId))
    .limit(1)

  if (!item.length) {
    throw BadRequestError('Item not found')
  }

  return item[0]
}

// Get all items
export const getAllItems = async () => {
  // Join items with categories
  const itemsWithCategory = await db
    .select({
      item: itemModel, // select all columns from item
      categoryName: categoryModel.name, // only category name
    })
    .from(itemModel)
    .leftJoin(categoryModel, eq(itemModel.categoryId, categoryModel.categoryId))

  if (!itemsWithCategory.length) {
    throw BadRequestError('No items found')
  }

  // Map to combine ...item and categoryName into a single object
  const result = itemsWithCategory.map(({ item, categoryName }) => ({
    ...item,
    categoryName, // add categoryName field
  }))

  return result
}

// Update item
export const updateItem = async (
  itemId: number,
  itemData: Partial<NewItem>
) => {
  const existingItem = await getItemById(itemId)

  if (itemData.name && itemData.name !== existingItem.name) {
    const nameExists = await db
      .select()
      .from(itemModel)
      .where(eq(itemModel.name, itemData.name))
      .limit(1)

    if (nameExists.length > 0) {
      throw BadRequestError('Item name already exists')
    }
  }

  const [updatedItem] = await db
    .update(itemModel)
    .set(itemData)
    .where(eq(itemModel.itemId, itemId))

  return updatedItem
}

// Delete item
export const deleteItem = async (itemId: number) => {
  await getItemById(itemId) // Check if exists

  await db.delete(itemModel).where(eq(itemModel.itemId, itemId))

  return { message: 'Item deleted successfully' }
}
