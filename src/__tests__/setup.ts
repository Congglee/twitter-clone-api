import { beforeAll, beforeEach, afterAll } from '@jest/globals'
import { Server } from 'http'
import { Prisma } from '@prisma/client'
import app from '~/app'
import prisma from '~/client'
import { removeExpiredRefreshTokens } from '~/jobs/auth.jobs'

let server: Server

// Get all model names dynamically from Prisma
const getModelNames = () => {
  // Get all models from Prisma schema
  const models = Prisma.dmmf.datamodel.models
  return models.map((model) => model.name.toLowerCase())
}

// Start the server and connect to the database before all tests
beforeAll(async () => {
  await prisma.$connect()

  // Using port 0 will start the server on a random port
  server = app.listen(0)
})

// Clean all tables before each test
beforeEach(async () => {
  const models = getModelNames()
  try {
    // Disable foreign key checks and truncate all tables
    for (const model of models) {
      if ((prisma as any)[model]) {
        await (prisma as any)[model].deleteMany({})
      }
    }
  } catch (error) {
    console.error('Error cleaning database:', error)
    throw error
  }
})

afterAll(async () => {
  await prisma.$disconnect()
  server.close()

  // Stop the cron job
  removeExpiredRefreshTokens.stop()
})

export { server }
