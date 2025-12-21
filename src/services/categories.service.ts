import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { BadRequestError } from "./utils/errors.utils";
import { categoryModel, NewCategory } from "../schemas";


// Create a new category
export const createCategory = async (categoryData: NewCategory) => {
  try {
    const [newCategory] = await db
      .insert(categoryModel)
      .values(categoryData)
      .$returningId();

    return newCategory;
  } catch (error) {
    throw error;
  }
};

// Get category by ID
export const getCategoryById = async (categoryId: number) => {
  const category = await db
    .select()
    .from(categoryModel)
    .where(eq(categoryModel.categoryId, categoryId))
    .limit(1);

  if (!category.length) {
    throw BadRequestError("Category not found");
  }

  return category[0];
};

// Get all categories
export const getAllCategories = async () => {
  const categories = await db.select().from(categoryModel);

  if (!categories.length) {
    throw BadRequestError("No categories found");
  }

  return categories;
};

// Update category
export const updateCategory = async (
  categoryId: number,
  categoryData: Partial<NewCategory>
) => {
  const existingCategory = await getCategoryById(categoryId);

  if (
    categoryData.name &&
    categoryData.name !== existingCategory.name
  ) {
    const nameExists = await db
      .select()
      .from(categoryModel)
      .where(eq(categoryModel.name, categoryData.name))
      .limit(1);

    if (nameExists.length > 0) {
      throw BadRequestError("Category name already exists");
    }
  }

  const [updatedCategory] = await db
    .update(categoryModel)
    .set(categoryData)
    .where(eq(categoryModel.categoryId, categoryId));

  return updatedCategory;
};

// Delete category
export const deleteCategory = async (categoryId: number) => {
  await getCategoryById(categoryId); // Check if exists

  await db
    .delete(categoryModel)
    .where(eq(categoryModel.categoryId, categoryId));

  return { message: "Category deleted successfully" };
};
