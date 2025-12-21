import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { BadRequestError } from './utils/errors.utils'
import { supplierModel, NewSupplier } from '../schemas'

// Create a new supplier
export const createSupplier = async (supplierData: NewSupplier) => {
  try {
    const [newSupplier] = await db
      .insert(supplierModel)
      .values(supplierData)
      .$returningId()

    return newSupplier
  } catch (error) {
    throw error
  }
}

// Get supplier by ID
export const getSupplierById = async (supplierId: number) => {
  const supplier = await db
    .select()
    .from(supplierModel)
    .where(eq(supplierModel.supplierId, supplierId))
    .limit(1)

  if (!supplier.length) {
    throw BadRequestError('Supplier not found')
  }

  return supplier[0]
}

// Get all suppliers
export const getAllSuppliers = async () => {
  const suppliers = await db.select().from(supplierModel)

  if (!suppliers.length) {
    throw BadRequestError('No suppliers found')
  }

  return suppliers
}

// Update supplier
export const updateSupplier = async (
  supplierId: number,
  supplierData: Partial<NewSupplier>
) => {
  const existingSupplier = await getSupplierById(supplierId)

  if (
    supplierData.email &&
    supplierData.email !== existingSupplier.email
  ) {
    const emailExists = await db
      .select()
      .from(supplierModel)
      .where(eq(supplierModel.email, supplierData.email))
      .limit(1)

    if (emailExists.length > 0) {
      throw BadRequestError('Supplier email already exists')
    }
  }

  const [updatedSupplier] = await db
    .update(supplierModel)
    .set(supplierData)
    .where(eq(supplierModel.supplierId, supplierId))

  return updatedSupplier
}

// Delete supplier
export const deleteSupplier = async (supplierId: number) => {
  await getSupplierById(supplierId) // Check if exists

  await db
    .delete(supplierModel)
    .where(eq(supplierModel.supplierId, supplierId))

  return { message: 'Supplier deleted successfully' }
}
