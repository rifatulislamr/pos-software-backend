import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { BadRequestError } from './utils/errors.utils'
import { customerModel, NewCustomer } from '../schemas'

// Create a new customer
export const createCustomer = async (customerData: NewCustomer) => {
  try {
    const [newCustomer] = await db
      .insert(customerModel)
      .values(customerData)
      .$returningId()

    return newCustomer
  } catch (error) {
    throw error
  }
}

// Get customer by ID
export const getCustomerById = async (customerId: number) => {
  const customer = await db
    .select()
    .from(customerModel)
    .where(eq(customerModel.customerId, customerId))
    .limit(1)

  if (!customer.length) {
    throw BadRequestError('Customer not found')
  }

  return customer[0]
}

// Get all customers
export const getAllCustomers = async () => {
  const customers = await db.select().from(customerModel)

  if (!customers.length) {
    throw BadRequestError('No customers found')
  }

  return customers
}

// Update customer
export const updateCustomer = async (
  customerId: number,
  customerData: Partial<NewCustomer>
) => {
  const existingCustomer = await getCustomerById(customerId)

  if (
    customerData.email &&
    customerData.email !== existingCustomer.email
  ) {
    const emailExists = await db
      .select()
      .from(customerModel)
      .where(eq(customerModel.email, customerData.email))
      .limit(1)

    if (emailExists.length > 0) {
      throw BadRequestError('Customer email already exists')
    }
  }

  const [updatedCustomer] = await db
    .update(customerModel)
    .set(customerData)
    .where(eq(customerModel.customerId, customerId))

  return updatedCustomer
}

// Delete customer
export const deleteCustomer = async (customerId: number) => {
  await getCustomerById(customerId) // Check if exists

  await db
    .delete(customerModel)
    .where(eq(customerModel.customerId, customerId))

  return { message: 'Customer deleted successfully' }
}
