import { desc, eq } from 'drizzle-orm'
import { purchases } from '../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = typeof query.userId === 'string' ? query.userId.trim() : ''

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId query param is required',
    })
  }

  const [row] = await db
    .select({ id: purchases.id, offerId: purchases.offerId })
    .from(purchases)
    .where(eq(purchases.userId, userId))
    .orderBy(desc(purchases.createdAt))
    .limit(1)

  if (!row) {
    return { active: false as const }
  }

  return { active: true as const, id: row.id, offerId: row.offerId }
})
