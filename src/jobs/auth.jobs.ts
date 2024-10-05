import cron from 'node-cron'
import prisma from '~/client'
import logger from '~/config/logger'

// Run every hour
export const removeExpiredRefreshTokens = cron.schedule('0 * * * *', async () => {
  const now = new Date()
  logger.success(`Running cron job to delete expired refresh tokens at ${now}`)

  try {
    const data = await prisma.refreshToken.deleteMany({
      where: { exp: { lt: now } }
    })
    logger.success(`Deleted ${data.count} expired refresh tokens`)
  } catch (error) {
    logger.error(`Error deleting expired refresh tokens: ${error}}`)
  }
})
