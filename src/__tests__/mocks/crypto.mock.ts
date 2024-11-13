/*
 * A mock function that simulates password hashing for testing purposes,
 * Instead of actually hashing the password, it returns a constant string 'mocked-hashed-password'
 * This helps in making tests predictable and avoids actual cryptographic operations during testing
 *  - jest.fn() creates a new mock function
 *  - mockReturnValue() sets the return value of the mock function
 */
export const mockHashPassword = jest.fn().mockReturnValue((password: string) => `${password}_hashed`)

export const crypto = {
  hashPassword: mockHashPassword
}

// Mocking the hashPassword function from '~/utils/crypto' module
jest.mock('~/utils/crypto', () => ({
  __esModule: true,
  // Replaces the original hashPassword function with the mock function
  hashPassword: mockHashPassword
}))
