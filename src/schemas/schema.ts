import {
  avg,
  InferInsertModel,
  InferSelectModel,
  relations,
  sql,
} from 'drizzle-orm'
import { bigint, json } from 'drizzle-orm/gel-core'
import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
  text,
  decimal,
  double,
  date,
  mysqlEnum,
} from 'drizzle-orm/mysql-core'

// ========================
// Roles & Permissions
// ========================
export const roleModel = mysqlTable('roles', {
  roleId: int('role_id').primaryKey(),
  roleName: varchar('role_name', { length: 50 }).notNull(),
})

export const userModel = mysqlTable('users', {
  userId: int('user_id').primaryKey().autoincrement(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('PASSWORD', { length: 255 }).notNull(),
  active: boolean('active').notNull().default(true),
  roleId: int('role_id').references(() => roleModel.roleId, {
    onDelete: 'set null',
  }),
  isPasswordResetRequired: boolean('is_password_reset_required').default(true),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
})

export const permissionsModel = mysqlTable('permissions', {
  id: int('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
})

export const rolePermissionsModel = mysqlTable('role_permissions', {
  roleId: int('role_id').references(() => roleModel.roleId),
  permissionId: int('permission_id')
    .notNull()
    .references(() => permissionsModel.id),
})

export const userRolesModel = mysqlTable('user_roles', {
  userId: int('user_id')
    .notNull()
    .references(() => userModel.userId),
  roleId: int('role_id')
    .notNull()
    .references(() => roleModel.roleId),
})

// ========================
// Business Domain Tables
// ========================

//Categories table

export const categoryModel = mysqlTable('categories', {
  categoryId: int('category_id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
})

//items model
export const itemModel = mysqlTable('items', {
  itemId: int('item_id').primaryKey().autoincrement(),

  // Basic info
  name: varchar('name', { length: 255 }).notNull(),
  // Foreign key reference to categoryModel
  categoryId: int('category_id')
    .notNull()
    .references(() => categoryModel.categoryId),

  description: text('description'),

  // Availability
  availableForSale: boolean('available_for_sale').default(true),
  soldBy: varchar('sold_by', { length: 20 }).default('Each'),

  // Pricing
  price: decimal('price', { precision: 10, scale: 2 }),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  margin: decimal('margin', { precision: 5, scale: 2 }),

  // Identifiers
  sku: varchar('sku', { length: 100 }),
  barcode: varchar('barcode', { length: 100 }),

  // Inventory
  compositeItem: boolean('composite_item').default(false),
  trackStock: boolean('track_stock').default(false),
  inStock: int('in_stock').default(0),
  lowStock: int('low_stock'),
  primarySupplier: varchar('primary_supplier', { length: 255 }),

  // POS Representation
  color: varchar('color', { length: 20 }).default('#FFFFFF'),
  shape: varchar('shape', { length: 20 }).default('check'),
  imageUrl: varchar('image_url', { length: 500 }),

  // Variant & Options (combined)
  variantName: varchar('variant_name', { length: 100 }),
  optionName: varchar('option_name', { length: 50 }),
  optionValue: varchar('option_value', { length: 50 }),
  variantSku: varchar('variant_sku', { length: 100 }),
  variantInStock: int('variant_in_stock'),

  // Composite Components (JSON or CSV)
  components: text('components'),

  // Timestamps
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
})

//customers model
export const customerModel = mysqlTable('customers', {
  customerId: int('customer_id').primaryKey().autoincrement(),

  // Basic info
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 100 }),
  region: varchar('region', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('Bangladesh'),
  customerCode: varchar('customer_code', { length: 50 }),
  note: text('note'),

  // Stats
  totalVisits: int('total_visits').default(sql`0`),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default(
    sql`0.00`
  ),
  points: decimal('points', { precision: 10, scale: 2 }).default(sql`0.00`),
  // Availability
  availableForSale: boolean('available_for_sale').default(true),

  // Timestamps
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
})

// Suppliers model
export const supplierModel = mysqlTable('suppliers', {
  supplierId: int('supplier_id').primaryKey().autoincrement(),

  // Basic info
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 100 }),
  region: varchar('region', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('Bangladesh'),
  supplierCode: varchar('supplier_code', { length: 50 }),
  note: text('note'),

  // Stats
  totalOrders: int('total_orders').default(sql`0`),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default(
    sql`0.00`
  ),
  points: decimal('points', { precision: 10, scale: 2 }).default(sql`0.00`),

  // Availability
  availableForSale: boolean('available_for_sale').default(true),

  // Timestamps
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
})

// Purchase Orders
export const purchaseOrderModel = mysqlTable('purchase_orders', {
  purchaseOrderId: int('purchase_order_id').primaryKey().autoincrement(),

  orderNumber: varchar('order_number', { length: 50 }).notNull(),
  orderedBy: varchar('ordered_by', { length: 100 }).notNull(),

  supplierId: int('supplier_id')
    .notNull()
    .references(() => supplierModel.supplierId, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),

  orderDate: varchar('order_date', { length: 20 }).notNull(),
  expectedDate: varchar('expected_date', { length: 20 }),

  // Changed destinationStore to integer referencing storeId
  destinationStoreId: int('destination_store_id').references(
    () => storeModel.storeId,
    {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }
  ),

  status: mysqlEnum('status', [
    'Draft',
    'Pending',
    'Partially received',
    'Closed',
  ]).default('Draft'),

  received: varchar('received', { length: 50 }).default('0 of 0'),

  notes: text('notes'),

  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
})

//purchase_order_items
export const purchaseOrderItemModel = mysqlTable('purchase_order_items', {
  poItemId: int('po_item_id').primaryKey().autoincrement(),

  purchaseOrderId: int('purchase_order_id')
    .notNull()
    .references(() => purchaseOrderModel.purchaseOrderId, {
      onDelete: 'cascade',
    }),

  itemId: int('item_id')
    .notNull()
    .references(() => itemModel.itemId),

  quantity: int('quantity').notNull(),
  receivedQty: int('received_qty').default(0),

  purchaseCost: decimal('purchase_cost', {
    precision: 10,
    scale: 2,
  }).notNull(),

  amount: decimal('amount', {
    precision: 10,
    scale: 2,
  }).notNull(),
})

//purchase_order_additional_costs
export const purchaseOrderAdditionalCostModel = mysqlTable(
  'purchase_order_additional_costs',
  {
    costId: int('cost_id').primaryKey().autoincrement(),

    purchaseOrderId: int('purchase_order_id')
      .notNull()
      .references(() => purchaseOrderModel.purchaseOrderId, {
        onDelete: 'cascade',
      }),

    name: varchar('name', { length: 255 }).notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  }
)

//store model
export const storeModel = mysqlTable('stores', {
  storeId: int('store_id').primaryKey().autoincrement(),

  name: varchar('name', { length: 150 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  region: varchar('region', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  description: text('description'),

  numberOfPOS: int('number_of_pos').default(1).notNull(),

  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
})

export const storeTransactionModel = mysqlTable('store_transactions', {
  transactionId: int('transaction_id').primaryKey().autoincrement(),

  itemId: int('item_id')
    .notNull()
    .references(() => itemModel.itemId),

  transactionType: mysqlEnum('transaction_type', [
    'purchase',
    'sale',
    'sales_return',
    'purchase_return',
    'adjustment',
    'wastage',
  ]).notNull(),

  // + increase stock, - decrease stock
  quantity: int('quantity').notNull(),

  purchaseCost: decimal('purchase_cost', { precision: 10, scale: 2 }),

  // audit fields
  createdBy: int('created_by').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedBy: int('updated_by'),

  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// sales model (master)
export const salesMasterModel = mysqlTable('sales_master', {
  saleMasterId: int('sale_master_id').autoincrement().primaryKey(),

  paymentType: mysqlEnum('payment_type', ['cash', 'credit']).notNull(),

  customerId: int('customer_id')
    .notNull()
    .references(() => customerModel.customerId, { onDelete: 'cascade' }),

  saleDate: date('sale_date').notNull(),

  totalQuantity: int('total_quantity').notNull(),
  totalAmount: double('total_amount').notNull(),

  discountAmount: double('discount_amount').notNull().default(0),

  notes: text('notes'),

  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// Sale Items (Details)
export const salesDetailsModel = mysqlTable('sales_details', {
  saleDetailsId: int('sale_details_id').autoincrement().primaryKey(),
  saleMasterId: int('sale_master_id')
    .notNull()
    .references(() => salesMasterModel.saleMasterId, { onDelete: 'cascade' }),
  itemId: int('item_id')
    .notNull()
    .references(() => itemModel.itemId, { onDelete: 'cascade' }),
  avgPrice: double('avg_price'),
  quantity: int('quantity').notNull(),
  amount: double('amount').notNull(),
  unitPrice: double('unit_price').notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// Sales Return model
export const salesReturnModel = mysqlTable('sales_return', {
  saleReturnId: int('sale_return_id').autoincrement().primaryKey(),
  saleDetailsId: int('sale_details_id')
    .notNull()
    .references(() => salesDetailsModel.saleDetailsId, { onDelete: 'cascade' }),
  returnQuantity: int('return_quantity').notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// ========================
// Relations
// ========================
export const userRelations = relations(userModel, ({ one }) => ({
  role: one(roleModel, {
    fields: [userModel.roleId],
    references: [roleModel.roleId],
  }),
}))

export const roleRelations = relations(roleModel, ({ many }) => ({
  rolePermissions: many(rolePermissionsModel),
}))

export const rolePermissionsRelations = relations(
  rolePermissionsModel,
  ({ one }) => ({
    role: one(roleModel, {
      fields: [rolePermissionsModel.roleId],
      references: [roleModel.roleId],
    }),
    permission: one(permissionsModel, {
      fields: [rolePermissionsModel.permissionId],
      references: [permissionsModel.id],
    }),
  })
)

export const userRolesRelations = relations(userRolesModel, ({ one }) => ({
  user: one(userModel, {
    fields: [userRolesModel.userId],
    references: [userModel.userId],
  }),
  role: one(roleModel, {
    fields: [userRolesModel.roleId],
    references: [roleModel.roleId],
  }),
}))

export const purchaseOrderRelations = relations(
  purchaseOrderModel,
  ({ one }) => ({
    supplier: one(supplierModel, {
      fields: [purchaseOrderModel.supplierId],
      references: [supplierModel.supplierId],
    }),
    destinationStore: one(storeModel, {
      fields: [purchaseOrderModel.destinationStoreId],
      references: [storeModel.storeId],
    }),
  })
)

export const purchaseOrderItemRelations = relations(
  purchaseOrderItemModel,
  ({ many }) => ({
    item: many(itemModel),
    purchaseOrder: many(purchaseOrderModel),
  })
)

export const purchaseOrderAdditionalCostRelations = relations(
  purchaseOrderAdditionalCostModel,
  ({ many }) => ({
    purchaseOrder: many(purchaseOrderModel),
  })
)

// Relation from Item → Category
export const itemCategoryRelations = relations(itemModel, ({ one }) => ({
  category: one(categoryModel, {
    fields: [itemModel.categoryId], // column in itemModel
    references: [categoryModel.categoryId], // referenced column in categoryModel
  }),
}))

//sale items relations
export const salesMasterRelations = relations(
  salesMasterModel,
  ({ one, many }) => ({
    customer: one(customerModel, {
      fields: [salesMasterModel.customerId],
      references: [customerModel.customerId],
    }),
    items: many(salesDetailsModel), // a sale can have many items
  })
)

// sale items relations
export const salesDetailsRelations = relations(
  salesDetailsModel,
  ({ one, many }) => ({
    saleMaster: one(salesMasterModel, {
      fields: [salesDetailsModel.saleMasterId],
      references: [salesMasterModel.saleMasterId],
    }),
    item: one(itemModel, {
      fields: [salesDetailsModel.itemId],
      references: [itemModel.itemId],
    }),
    returns: many(salesReturnModel), // a sale item can have multiple returns
  })
)

// sales return relations
export const salesReturnRelations = relations(salesReturnModel, ({ one }) => ({
  saleDetail: one(salesDetailsModel, {
    fields: [salesReturnModel.saleDetailsId],
    references: [salesDetailsModel.saleDetailsId],
  }),
}))

//users types
export type User = typeof userModel.$inferSelect
export type NewUser = typeof userModel.$inferInsert
export type Role = typeof roleModel.$inferSelect
export type NewRole = typeof roleModel.$inferInsert
export type Permission = typeof permissionsModel.$inferSelect
export type NewPermission = typeof permissionsModel.$inferInsert
export type UserRole = typeof userRolesModel.$inferSelect
export type NewUserRole = typeof userRolesModel.$inferInsert

// categories types
export type Category = typeof categoryModel.$inferSelect
export type NewCategory = typeof categoryModel.$inferInsert

// items types
export type Item = typeof itemModel.$inferSelect
export type NewItem = typeof itemModel.$inferInsert

//customers types
export type Customer = typeof customerModel.$inferSelect
export type NewCustomer = typeof customerModel.$inferInsert

// Supplier types
export type Supplier = typeof supplierModel.$inferSelect
export type NewSupplier = typeof supplierModel.$inferInsert

// Purchase Orders
export type PurchaseOrder = typeof purchaseOrderModel.$inferSelect

export type NewPurchaseOrder = typeof purchaseOrderModel.$inferInsert

// Purchase Order Items
export type PurchaseOrderItem = typeof purchaseOrderItemModel.$inferSelect

export type NewPurchaseOrderItem = typeof purchaseOrderItemModel.$inferInsert

// Purchase Order Additional Costs
export type PurchaseOrderAdditionalCost =
  typeof purchaseOrderAdditionalCostModel.$inferSelect

export type NewPurchaseOrderAdditionalCost =
  typeof purchaseOrderAdditionalCostModel.$inferInsert

//stores types
export type NewStore = typeof storeModel.$inferInsert
export type Store = typeof storeModel.$inferSelect

// store transaction types
export type StoreTransaction = typeof storeTransactionModel.$inferSelect
export type NewStoreTransaction = typeof storeTransactionModel.$inferInsert

// sales types
export type SaleMaster = typeof salesMasterModel.$inferSelect
export type NewSaleMaster = typeof salesMasterModel.$inferInsert

// sales details types
export type SaleDetails = typeof salesDetailsModel.$inferSelect
export type NewSaleDetails = typeof salesDetailsModel.$inferInsert

//sales return types
export type SaleReturn = typeof salesReturnModel.$inferSelect
export type NewSaleReturn = typeof salesReturnModel.$inferInsert
