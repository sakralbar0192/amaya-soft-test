import { eq } from 'drizzle-orm'
import { purchases } from '../db/schema'

type CancelBody = {
  userId?: unknown
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CancelBody>(event)
  const userId = typeof body?.userId === 'string' ? body.userId.trim() : ''

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId is required',
    })
  }

  await db.delete(purchases).where(eq(purchases.userId, userId))

  return { ok: true as const }
})
