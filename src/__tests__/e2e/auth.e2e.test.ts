import { faker } from '@faker-js/faker'
import { describe } from '@jest/globals'
import { User } from '@prisma/client'
import request from 'supertest'
import { newUserFixture } from '~/__tests__/fixtures/users.fixtures'
import { createMockUser } from '~/__tests__/helpers/data'
import { logErrorDetails } from '~/__tests__/helpers/logger'
import { prismaMock } from '~/__tests__/singleton'
import app from '~/app'
import HTTP_STATUS from '~/config/httpStatus'
import { AUTH_MESSAGES } from '~/config/messages'

describe('Auth End-to-End Tests', () => {
  describe('POST /auth/register', () => {
    test('should register user successfully and return access & refresh tokens', async () => {
      // Execute registration request
      const response = await request(app).post('/auth/register').send(newUserFixture)

      logErrorDetails(response)

      // Verify response
      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(response.body).toEqual({
        message: AUTH_MESSAGES.REGISTER_SUCCESS,
        result: {
          access_token: expect.any(String),
          refresh_token: expect.any(String)
        }
      })
    })

    describe('validation errors', () => {
      test('should return 422 when email is invalid', async () => {
        const invalidEmailUser = { ...newUserFixture, email: 'invalid-email' }
        const response = await request(app).post('/auth/register').send(invalidEmailUser)

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

      describe('duplicate email validation', () => {
        let mockUser: User

        beforeEach(() => {
          // Create mock user
          mockUser = createMockUser({
            name: newUserFixture.name,
            email: newUserFixture.email,
            dateOfBirth: new Date(newUserFixture.date_of_birth),
            password: newUserFixture.password
          })

          // Mock user.create to resolve with mockUser when called
          prismaMock.user.create.mockResolvedValue(mockUser)

          // Mock user.findUnique to resolve with mockUser when called
          prismaMock.user.findUnique.mockResolvedValue(mockUser)
        })

        test('should return 422 when email already exists', async () => {
          const response = await request(app).post('/auth/register').send(newUserFixture)

          expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          expect(response.body).toEqual({
            message: AUTH_MESSAGES.VALIDATION_ERROR,
            errors: {
              email: expect.objectContaining({
                msg: AUTH_MESSAGES.EMAIL_ALREADY_EXISTS
              })
            }
          })
        })
      })

      test('should return 422 when password and confirm_password is missing', async () => {
        const missingPasswordUser = {
          ...newUserFixture,
          password: '',
          confirm_password: ''
        }
        const response = await request(app).post('/auth/register').send(missingPasswordUser)

        expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        expect(response.body).toEqual({
          message: AUTH_MESSAGES.VALIDATION_ERROR,
          errors: {
            password: expect.objectContaining({
              msg: AUTH_MESSAGES.PASSWORD_IS_REQUIRED
            }),
            confirm_password: expect.objectContaining({
              msg: AUTH_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
            })
          }
        })
      })

      test('should return 422 when password and confirm_password type is not a string', async () => {
        const invalidPasswordUser = { ...newUserFixture, password: 1234, confirm_password: 1234 }
        const response = await request(app).post('/auth/register').send(invalidPasswordUser)

        expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        expect(response.body).toEqual({
          message: AUTH_MESSAGES.VALIDATION_ERROR,
          errors: {
            password: expect.objectContaining({
              msg: AUTH_MESSAGES.PASSWORD_MUST_BE_STRING
            }),
            confirm_password: expect.objectContaining({
              msg: AUTH_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
            })
          }
        })
      })

      test('should return 422 when password and confirm_password length is not between 6 and 50', async () => {
        const shortPasswordUser = { ...newUserFixture, password: 'Short', confirm_password: 'Short' }
        const response = await request(app).post('/auth/register').send(shortPasswordUser)

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

      test('should return 422 when password and confirm_password is not strong', async () => {
        const weakPasswordUser = {
          ...newUserFixture,
          password: 'weakpassword',
          confirm_password: 'weakpassword'
        }
        const response = await request(app).post('/auth/register').send(weakPasswordUser)

        expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        expect(response.body).toEqual({
          message: AUTH_MESSAGES.VALIDATION_ERROR,
          errors: {
            password: expect.objectContaining({
              msg: AUTH_MESSAGES.PASSWORD_MUST_BE_STRONG
            }),
            confirm_password: expect.objectContaining({
              msg: AUTH_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
            })
          }
        })
      })

      test('should return 422 when passwords do not match', async () => {
        const mismatchedPasswordUser = { ...newUserFixture, confirm_password: 'Different@1234' }
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

      test('should return 422 when name is missing', async () => {
        const missingNameUser = { ...newUserFixture, name: '' }
        const response = await request(app).post('/auth/register').send(missingNameUser)

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

      test('should return 422 when name type is not a string', async () => {
        const invalidNameUser = { ...newUserFixture, name: 1234 }
        const response = await request(app).post('/auth/register').send(invalidNameUser)

        expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        expect(response.body).toEqual({
          message: AUTH_MESSAGES.VALIDATION_ERROR,
          errors: {
            name: expect.objectContaining({
              msg: AUTH_MESSAGES.NAME_MUST_BE_STRING
            })
          }
        })
      })

      test('should return 422 when name length is not between 1 and 100', async () => {
        const longNameUser = { ...newUserFixture, name: faker.lorem.words(101) }
        const response = await request(app).post('/auth/register').send(longNameUser)

        expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        expect(response.body).toEqual({
          message: AUTH_MESSAGES.VALIDATION_ERROR,
          errors: {
            name: expect.objectContaining({
              msg: AUTH_MESSAGES.NAME_LENGTH_MUST_BE_BETWEEN_1_AND_100
            })
          }
        })
      })

      test('should return 422 when date_of_birth is not in ISO 8601 format', async () => {
        const invalidDateUser = { ...newUserFixture, date_of_birth: 'invalid-date' }
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
