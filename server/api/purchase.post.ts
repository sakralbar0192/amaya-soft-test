import { purchases } from '../db/schema'

type PurchaseBody = {
  offerId?: unknown
  userId?: unknown
}

export default defineEventHandler(async (event) => {
  const body = await readBody<PurchaseBody>(event)
  const offerId = typeof body?.offerId === 'string' ? body.offerId.trim() : ''
  const userId = typeof body?.userId === 'string' ? body.userId.trim() : ''

  if (!offerId || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'offerId and userId are required non-empty strings',
    })
  }

  const [row] = await db
    .insert(purchases)
    .values({ offerId, userId })
    .returning({ id: purchases.id })

  if (!row) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create purchase',
    })
  }

  return { ok: true as const, id: row.id }
})
