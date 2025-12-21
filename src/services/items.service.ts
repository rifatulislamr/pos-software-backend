import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { BadRequestError } from './utils/errors.utils';
import { itemModel, NewItem } from '../schemas';

// Create a new item
export const createItem = async (itemData: NewItem) => {
  try {
    const [newItem] = await db
      .insert(itemModel)
      .values(itemData)
      .$returningId();
    return newItem;
  } catch (error) {
    throw error;
  }
};

// Get item by ID
export const getItemById = async (itemId: number) => {
  const item = await db
    .select()
    .from(itemModel)
    .where(eq(itemModel.itemId, itemId))
    .limit(1);

  if (!item.length) {
    throw BadRequestError('Item not found');
  }

  return item[0];
};

// Get all items
export const getAllItems = async () => {
  const items = await db.select().from(itemModel);
  if (!items.length) {
    throw BadRequestError('No items found');
  }
  return items;
};

// Update item
export const updateItem = async (itemId: number, itemData: Partial<NewItem>) => {
  const existingItem = await getItemById(itemId);

  if (itemData.name && itemData.name !== existingItem.name) {
    const nameExists = await db
      .select()
      .from(itemModel)
      .where(eq(itemModel.name, itemData.name))
      .limit(1);

    if (nameExists.length > 0) {
      throw BadRequestError('Item name already exists');
    }
  }

  const [updatedItem] = await db
    .update(itemModel)
    .set(itemData)
    .where(eq(itemModel.itemId, itemId));

  return updatedItem;
};

// Delete item
export const deleteItem = async (itemId: number) => {
  await getItemById(itemId); // Check if exists

  await db
    .delete(itemModel)
    .where(eq(itemModel.itemId, itemId));

  return { message: 'Item deleted successfully' };
};
