import { NextFunction, Request, Response } from 'express';
import { createInsertSchema } from 'drizzle-zod';
import { requirePermission } from '../services/utils/jwt.utils';
import { itemModel } from '../schemas';
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} from '../services/items.service';

const createItemSchema = createInsertSchema(itemModel);
const editItemSchema = createItemSchema
  .omit({
    itemId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: createItemSchema.shape.name.optional(),
    categoryId: createItemSchema.shape.categoryId.optional(),
    description: createItemSchema.shape.description.optional(),
    price: createItemSchema.shape.price.optional(),
    cost: createItemSchema.shape.cost.optional(),
  });

export const createItemController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requirePermission(req, 'create_item');
    const itemData = createItemSchema.parse(req.body);
    const item = await createItem(itemData);
    res.status(201).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

export const getAllItemsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requirePermission(req, 'view_item');
    const items = await getAllItems();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getItemController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requirePermission(req, 'view_item');
    const id = Number(req.params.id);
    const item = await getItemById(id);
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const editItemController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requirePermission(req, 'edit_item');
    const id = Number(req.params.id);
    const itemData = editItemSchema.parse(req.body);
    const item = await updateItem(id, itemData);
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const deleteItemController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requirePermission(req, 'delete_item');
    const id = Number(req.params.id);
    const result = await deleteItem(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
