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

// Items table
export const itemModel = mysqlTable('items', {
  itemId: int('item_id').primaryKey().autoincrement(),

  // Basic info
  name: varchar('name', { length: 255 }).notNull(),
  categoryId: int('category_id'),
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
  variantName: varchar('variant_name', { length: 100 }), // optional
  optionName: varchar('option_name', { length: 50 }), // optional
  optionValue: varchar('option_value', { length: 50 }), // optional
  variantSku: varchar('variant_sku', { length: 100 }),
  variantInStock: int('variant_in_stock'),

  // Composite Components (JSON or CSV)
  components: text('components'), // store childItemId + quantity + cost as JSON

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

  destinationStore: varchar('destination_store', { length: 255 }),

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
  ({ one, many }) => ({
    supplier: one(supplierModel, {
      fields: [purchaseOrderModel.supplierId],
      references: [supplierModel.supplierId],
    }),
    items: many(purchaseOrderItemModel),
    additionalCosts: many(purchaseOrderAdditionalCostModel),
  })
)

export const purchaseOrderItemRelations = relations(
  purchaseOrderItemModel,
  ({ one }) => ({
    item: one(itemModel, {
      fields: [purchaseOrderItemModel.itemId],
      references: [itemModel.itemId],
    }),
  })
)

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
