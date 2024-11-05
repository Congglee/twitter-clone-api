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
   * Automatically restores mock state between tests
   * Prevents mocks from one test affecting another
   */
  restoreMocks: true,

  /*
   * Lists paths to exclude from code coverage reports
   * Ignores:
      - node_modules - Third-party dependencies
      - config - Configuration files
      - app.ts - Main application file
      - tests - Test files themselves
   */
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.ts', 'tests'],

  /*
   * Specifies output formats for coverage reports
   * Configured reporters:
   *  - text - Terminal output
   *  - lcov - Standard format for coverage tools
   *  - clover - XML format for CI tools
   *  - html - Browser-viewable report
   */
  coverageReporters: ['text', 'lcov', 'clover', 'html'],

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
   * Tells Jest where to look when resolving modules:
   *  - node_modules: The default location for installed packages
   *  - src: Allows imports directly from the src directory without relative paths
   */
  moduleDirectories: ['node_modules', 'src']
}
