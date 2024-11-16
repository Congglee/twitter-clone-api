import { beforeAll, beforeEach, afterAll } from '@jest/globals'
import { Server } from 'http'
import app from '../app'
import { removeExpiredRefreshTokens } from '../jobs/auth.jobs'
import { resetPrismaMock } from './singleton'

let server: Server

/** 
  `beforeAll` is a Jest hook that runs once before all tests in a test suite.
  It is used to set up the testing environment before running tests.
  It takes a callback function as an argument that will be executed before all tests.

  @example
  beforeAll(() => {
    // Setup code here
  });
*/
// Start the server before all tests
beforeAll(async () => {
  // Using port 0 will start the server on a random port
  server = app.listen(0)
})

/*
  `beforeEach` is a Jest hook that runs before each test in a test suite.
  It is used to set up the testing environment before running each test.
  It takes a callback function as an argument that will be executed before each test.

  @example
  beforeEach(() => {
    // Setup code here
  });
*/
beforeEach(() => {
  // Clear all mocks instead of clearing DB
  jest.clearAllMocks()
  resetPrismaMock()
})

/*
  `afterAll` is a Jest hook that runs once after all tests in a test suite.
  It is used to clean up the testing environment after running tests.
  It takes a callback function as an argument that will be executed

  @example
  afterAll(() => {
    // Cleanup code here
  });
*/
// Stop the server after all tests
afterAll(async () => {
  // await prisma.$disconnect()
  server.close()

  // Stop the cron job
  removeExpiredRefreshTokens.stop()
})

export { server }
