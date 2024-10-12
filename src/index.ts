import { config } from 'dotenv'
import { Server } from 'http'
import app from '~/app'
import prisma from '~/client'
import { envConfig } from '~/config/config'
import logger from '~/config/logger'
import tweetsService from '~/services/tweets.services'

config()

let server: Server

prisma.$connect().then(async () => {
  logger.success('Connected to SQL Database')

  // Check and create full-text search index for tweets content
  await tweetsService.indexTweets()

  server = app.listen(envConfig.port, () => {
    logger.success(`Listening to port ${envConfig.port}`)
  })
})

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed')
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
}

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error instanceof Error ? error.stack || error.message : String(error))
  exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
  logger.info('SIGTERM received')
  if (server) {
    server.close()
  }
})
