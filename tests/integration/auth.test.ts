import setupTestDB from '../utils/setupTestDB'
import { describe, beforeEach, test, expect } from '@jest/globals'
import { faker } from '@faker-js/faker'
import request from 'supertest'
import HTTP_STATUS from '../../src/config/httpStatus'
import app from '../../src/app'
import { AUTH_MESSAGES } from '../../src/config/messages'
import prisma from '../../src/client'

setupTestDB()

describe('Auth routes', () => {
  describe('POST /auth/register', () => {
    let newUser: {
      name: string
      email: string
      password: string
      confirm_password: string
      date_of_birth: string
    }

    beforeEach(() => {
      newUser = {
        name: faker.internet.displayName(),
        email: faker.internet.email(),
        password: 'Test@1234',
        confirm_password: 'Test@1234',
        date_of_birth: faker.date.past().toISOString()
      }
    })

    test('should register user successfully and return access & refresh tokens', async () => {
      const response = await request(app).post('/auth/register').send(newUser)

      // Log error details if status is not 200
      if (response.status !== HTTP_STATUS.OK) {
        console.error('Response body:', response.body)
      }

      expect(response.status).toBe(HTTP_STATUS.OK)

      // Check response structure and message
      expect(response.body).toEqual({
        message: AUTH_MESSAGES.REGISTER_SUCCESS,
        result: {
          access_token: expect.any(String),
          refresh_token: expect.any(String)
        }
      })

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: newUser.email }
      })

      // Check user was created successfully
      expect(user).toBeTruthy()

      // Check user data
      expect(user).toMatchObject({
        name: newUser.name,
        email: newUser.email,
        username: expect.stringMatching(/^user.+/),
        emailVerifyToken: expect.any(String)
      })

      // Verify refresh token was stored
      const refreshToken = await prisma.refreshToken.findFirst({
        where: { userId: user!.id }
      })

      // Check refresh token was stored successfully
      expect(refreshToken).toBeTruthy()
      expect(refreshToken).toMatchObject({
        userId: user!.id,
        token: expect.any(String),
        iat: expect.any(Date),
        exp: expect.any(Date)
      })
    })

    describe('validation errors', () => {
      test('should return 422 when email is invalid', async () => {
        const invalidUser = { ...newUser, email: 'invalid-email' }
        const response = await request(app).post('/auth/register').send(invalidUser)

        expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        expect(response.body).toEqual({
          message: AUTH_MESSAGES.VALIDATION_ERROR,
          errors: {
            email: expect.objectContaining({
              msg: AUTH_MESSAGES.EMAIL_IS_INVALID
            })
          }
        })
      })

      test('should return 422 when password is weak', async () => {
        const weakPasswordUser = { ...newUser, password: 'weak', confirm_password: 'weak' }
        const response = await request(app).post('/auth/register').send(weakPasswordUser)

        expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)

        expect(response.body).toEqual({
          message: AUTH_MESSAGES.VALIDATION_ERROR,
          errors: {
            password: expect.objectContaining({
              msg: AUTH_MESSAGES.PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50
            }),
            confirm_password: expect.objectContaining({
              msg: AUTH_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50
            })
          }
        })
      })

      test('should return 422 when passwords do not match', async () => {
        const mismatchedPasswordUser = { ...newUser, confirm_password: 'Different@1234' }
        const response = await request(app).post('/auth/register').send(mismatchedPasswordUser)

        expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        expect(response.body).toEqual({
          message: AUTH_MESSAGES.VALIDATION_ERROR,
          errors: {
            confirm_password: expect.objectContaining({
              msg: AUTH_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD
            })
          }
        })
      })

      test('should return 422 when name is empty', async () => {
        const emptyNameUser = { ...newUser, name: '' }
        const response = await request(app).post('/auth/register').send(emptyNameUser)

        expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        expect(response.body).toEqual({
          message: AUTH_MESSAGES.VALIDATION_ERROR,
          errors: {
            name: expect.objectContaining({
              msg: AUTH_MESSAGES.NAME_IS_REQUIRED
            })
          }
        })
      })

      test('should return 422 when date_of_birth is invalid', async () => {
        const invalidDateUser = { ...newUser, date_of_birth: 'invalid-date' }
        const response = await request(app).post('/auth/register').send(invalidDateUser)

        expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        expect(response.body).toEqual({
          message: AUTH_MESSAGES.VALIDATION_ERROR,
          errors: {
            date_of_birth: expect.objectContaining({
              msg: AUTH_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
            })
          }
        })
      })
    })
  })
})
