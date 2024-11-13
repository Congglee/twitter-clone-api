import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import prisma from '~/client'

// Mock the entire '~/client' module
// This will replace the default export of '~/client' with a Jest mock function that creates a deeply mocked object
jest.mock('~/client', () => ({
  // Indicate this is an ES Module
  __esModule: true,

  /*
   * Create a deeply mocked PrismaClient instance
   *  - `default` make this the default export of the module (import prisma from '~/client')
   *  - `mockDeep()` is a Jest mock function that creates a deeply mocked object with all properties mocked
   */
  default: mockDeep<PrismaClient>()
}))

// Now prisma is a Jest mock function that creates a deeply mocked object
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

export const resetPrismaMock = () => mockReset(prismaMock)
