/* eslint-disable no-undef */
/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  /*
   * Configures Jest to handle TypeScript files
   * Enables TypeScript compilation during testing
   */
  preset: 'ts-jest',

  /*
   * Sets the test environment to Node.js
   * Alternative to jsdom which would be used for browser-based tests
   */
  testEnvironment: 'node',

  /*
   * Sets environment variable for test runs
   * Helps distinguish test environment from development/production
   */
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },

  /*
   * Lists paths to exclude from code coverage reports
   * Ignores:
      - node_modules - Third-party dependencies
      - config - Configuration files
      - app.ts - Main application file
      - tests - Test files themselves
   */
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.ts', 'tests', 'src/client.ts'],

  /*
   * Creates an alias for import paths in your tests.
   * It uses regular expressions to map import paths:
   *  - ^~/(.*)$ - Maps paths starting with ~ to the src directory
   *  - (.*) captures any following path
   *  - Maps to <rootDir>/src/$1 where $1 is the captured path
   */
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },

  /*
   * Ensures setup.ts runs before tests
   */
  setupFiles: ['<rootDir>/src/__tests__/singleton.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  /*
   * Detect open handles (like database connections)
   * Useful for finding memory leaks
   */
  detectOpenHandles: true,

  /*
   * Force exit after all tests complete
   * Useful if some async operations are still running
   */
  forceExit: true
}
