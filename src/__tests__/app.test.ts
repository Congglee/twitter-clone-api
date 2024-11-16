import { describe, test, expect } from '@jest/globals'
import { Server } from 'http'
import request from 'supertest'
import app from '../app'
import { server } from './setup'

/**
 * `describe` creates a block that groups together several related tests.
 * It takes two arguments:
 * 1. A string description of the test suite
 * 2. A callback function containing the test suite definition
 *
 * This function is part of Jest's testing framework and helps organize tests
 * into logical groupings, making test output more readable and structured.
 *
 * @example
 * describe('User Authentication', () => {
 *   test('should login successfully', () => {
 *    // test code here
 *   });
 * });
 */
describe('Server Tests', () => {
  /**
   * `test` is a function that defines a single test case.
   * It takes two arguments:
   * 1. A string description of the test case
   * 2. A callback function containing the test case logic
   *
   * This function is part of Jest's testing framework and is used to define
   * individual test cases within a test suite.
   *
   * @example
   * test('should return 4 when adding 2 + 2', () => {
   *   expect(2 + 2).toBe(4);
   * });
   */
  test('should have a running server', () => {
    /**
     * `expect` is a function that wraps the value to be tested.
     * It is used to define the expected outcome of a test case.
     * It returns an object with Jest's matcher functions to test values.
     * Matchers are functions that let you test values in different ways. (ex: toBe, toBeTruthy, toBeFalsy)
     *
     * @example
     * expect(2 + 2).toBe(4);
     * expect('Hello').toBe('Hello');
     * expect(true).toBeTruthy();
     * expect(false).toBeFalsy();
     */

    // `toBeInstanceOf` is a matcher that checks if the received value is an instance of the expected class.
    expect(server).toBeInstanceOf(Server)

    // `listening` is a property of the server object that returns a boolean indicating if the server is listening for connections.
    // `toBe` is a matcher that checks if the received value is strictly equal to the expected value.
    expect(server.listening).toBe(true)
  })

  test('should respond to health check', async () => {
    // Option 1: Add trailing slash

    /**
     * `request` is a function that creates a new request to the server.
     * It takes one argument:
     * 1. The server instance to send the request to.
     *
     * This function is part of the `supertest` library and is used to send HTTP requests to the server for testing.
     *
     * @example
     * const response = await request(app).get('/health')
     * expect(response.status).toBe(200)
     */

    const response = await request(app).get('/api-docs/')
    expect(response.status).toBe(200)

    // Option 2: Allow both 200 and 301 status codes
    // const response = await request(app).get('/api-docs')
    // expect([200, 301]).toContain(response.status)
  })
})
