import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  offerId: text('offer_id').notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
