import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { describe, expect, test } from '@jest/globals'
import { mockClient } from 'aws-sdk-client-mock'
import { newUserFixture } from '~/__tests__/fixtures/users.fixtures'
import { createMockRefreshToken, createMockUser } from '~/__tests__/helpers/data'
import { prismaMock } from '~/__tests__/singleton'
import { TokenPayload } from '~/types/users.types'
import * as cryptoUtils from '~/utils/crypto'
import * as jwtUtils from '~/utils/jwt'
import * as mailUtils from '~/utils/mail'

describe('Auth Integration Tests', () => {
  jest.spyOn(jwtUtils, 'signToken').mockImplementation(() => {
    return Promise.resolve('mock.jwt.token')
  })

  jest.spyOn(jwtUtils, 'verifyToken').mockImplementation(() => {
    return Promise.resolve({
      user_id: 'test_user_id',
      token_type: 1,
      verify: 'Verified',
      exp: Math.floor(Date.now() / 1000) + 100 * 24 * 60 * 60,
      iat: 192837465
    })
  })

  jest.spyOn(cryptoUtils, 'hashPassword').mockImplementation((password) => {
    return `${password}_hashed`
  })

  beforeEach(() => {
    const sesMock = mockClient(SESClient)
    sesMock.reset()
    sesMock.on(SendEmailCommand).resolves({})
  })

  jest.spyOn(mailUtils, 'sendVerifyRegisterEmail').mockImplementation((toAddress, email_verify_token) => {
    // Mock the `sendVerifyRegisterEmail` function to resolve with an sample object when called
    return Promise.resolve({
      MessageId: 'mock-message-id',
      $metadata: {
        httpStatusCode: 200,
        requestId: 'mock-request-id',
        attempts: 1,
        totalRetryDelay: 0
      }
    })
  })

  test('should sign and return valid promise access token', async () => {
    const payload: Omit<TokenPayload, 'exp' | 'iat'> = {
      user_id: 'test_user_id',
      token_type: 0,
      verify: 'Verified'
    }

    const access_token = jwtUtils.signToken({
      payload,
      privateKey: 'access_token_secret',
      options: { expiresIn: '1h' }
    })

    expect(access_token).toBeInstanceOf(Promise)
    expect(access_token).resolves.toBe('mock.jwt.token')
  })

  test('should sign and return valid promise refresh token', async () => {
    const payload: Omit<TokenPayload, 'exp'> = {
      user_id: 'test_user_id',
      token_type: 1,
      verify: 'Verified',
      exp: Math.floor(Date.now() / 1000) + 100 * 24 * 60 * 60
    }

    const refresh_token = jwtUtils.signToken({
      payload,
      privateKey: 'refresh_token_secret',
      options: payload.exp ? undefined : { expiresIn: '100d' }
    })

    expect(refresh_token).toBeInstanceOf(Promise)
    expect(refresh_token).resolves.toBe('mock.jwt.token')
  })

  test('should sign and return valid promise access token and refresh token', async () => {
    const accessTokenpayload: Omit<TokenPayload, 'exp' | 'iat'> = {
      user_id: 'test_user_id',
      token_type: 0,
      verify: 'Verified'
    }

    const refreshTokenPayload: Omit<TokenPayload, 'iat'> = {
      user_id: 'test_user_id',
      token_type: 1,
      verify: 'Verified',
      exp: Math.floor(Date.now() / 1000) + 100 * 24 * 60 * 60
    }

    const access_token = jwtUtils.signToken({
      payload: accessTokenpayload,
      privateKey: 'access_token_secret',
      options: { expiresIn: '1h' }
    })

    const refresh_token = jwtUtils.signToken({
      payload: refreshTokenPayload,
      privateKey: 'refresh_token_secret',
      options: refreshTokenPayload.exp ? undefined : { expiresIn: '100d' }
    })

    expect(access_token).toBeInstanceOf(Promise)
    expect(access_token).resolves.toBe('mock.jwt.token')

    expect(refresh_token).toBeInstanceOf(Promise)
    expect(refresh_token).resolves.toBe('mock.jwt.token')
  })

  test('should sign and return valid promise email verify token', () => {
    const payload: Omit<TokenPayload, 'exp' | 'iat'> = {
      user_id: 'test_user_id',
      token_type: 3,
      verify: 'Verified'
    }

    const email_verify_token = jwtUtils.signToken({
      payload,
      privateKey: 'email_verify_token_secret',
      options: { expiresIn: '2h' }
    })

    expect(email_verify_token).toBeInstanceOf(Promise)
    expect(email_verify_token).resolves.toBe('mock.jwt.token')
  })

  test('should create a new user when register', async () => {
    const mockUser = createMockUser({
      name: newUserFixture.name,
      email: newUserFixture.email,
      dateOfBirth: new Date(newUserFixture.date_of_birth),
      password: newUserFixture.password
    })

    prismaMock.user.create.mockResolvedValue(mockUser)
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    expect(mockUser).toEqual({
      id: 'test_user_id',
      name: newUserFixture.name,
      email: newUserFixture.email,
      username: 'usertest_user_id',
      emailVerifyToken: 'test_email_verify_token',
      verify: 'Unverified',
      dateOfBirth: new Date(newUserFixture.date_of_birth),
      password: `${newUserFixture.password}_hashed`,
      forgotPasswordToken: '',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    })

    expect(cryptoUtils.hashPassword).toHaveBeenCalledWith(newUserFixture.password)
  })

  test('should send email verify token when register', async () => {
    const payload: Omit<TokenPayload, 'exp' | 'iat'> = {
      user_id: 'test_user_id',
      token_type: 3,
      verify: 'Verified'
    }

    const email_verify_token = await jwtUtils.signToken({
      payload,
      privateKey: 'email_verify_token_secret',
      options: { expiresIn: '2h' }
    })

    expect(jwtUtils.signToken).toBeCalledWith({
      payload: {
        user_id: 'test_user_id',
        token_type: 3,
        verify: 'Verified'
      },
      privateKey: 'email_verify_token_secret',
      options: { expiresIn: '2h' }
    })
    expect(email_verify_token).toBe('mock.jwt.token')

    await mailUtils.sendVerifyRegisterEmail(newUserFixture.email, email_verify_token)

    expect(mailUtils.sendVerifyRegisterEmail).toHaveBeenCalledTimes(1)
    expect(mailUtils.sendVerifyRegisterEmail).toHaveBeenCalledWith(newUserFixture.email, email_verify_token)
  })

  describe('Register Auth Tokens', () => {
    const refreshTokenPayload: TokenPayload = {
      user_id: 'test_user_id',
      token_type: 1,
      verify: 'Verified',
      exp: Math.floor(Date.now() / 1000) + 100 * 24 * 60 * 60,
      iat: 192837465
    }

    test("should decode valid refresh token's payload and create a new refresh token when register", async () => {
      const refresh_token = await jwtUtils.signToken({
        payload: refreshTokenPayload,
        privateKey: 'refresh_token_secret',
        options: refreshTokenPayload.exp ? undefined : { expiresIn: '100d' }
      })

      const decoded_payload = await jwtUtils.verifyToken({
        token: refresh_token,
        secretOrPublicKey: 'refresh_token_secret'
      })
      const { iat, exp } = decoded_payload

      expect(jwtUtils.verifyToken).toHaveBeenCalledWith({
        token: refresh_token,
        secretOrPublicKey: 'refresh_token_secret'
      })
      expect(decoded_payload).toEqual(refreshTokenPayload)

      const mockRefreshToken = createMockRefreshToken({
        userId: refreshTokenPayload.user_id,
        token: refresh_token,
        iat: new Date(iat * 1000),
        exp: new Date(exp * 1000)
      })

      prismaMock.refreshToken.create.mockResolvedValue(mockRefreshToken)
      prismaMock.refreshToken.findUnique.mockResolvedValue(mockRefreshToken)

      expect(mockRefreshToken).toEqual({
        id: 'test_refresh_token_id',
        userId: refreshTokenPayload.user_id,
        token: 'mock.jwt.token',
        exp: new Date(exp * 1000),
        iat: new Date(iat * 1000),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    test('should return access token and refresh token when register', async () => {
      const accessTokenpayload: Omit<TokenPayload, 'exp' | 'iat'> = {
        user_id: 'test_user_id',
        token_type: 0,
        verify: 'Verified'
      }

      const [access_token, refresh_token] = await Promise.all([
        jwtUtils.signToken({
          payload: accessTokenpayload,
          privateKey: 'access_token_secret',
          options: { expiresIn: '1h' }
        }),
        jwtUtils.signToken({
          payload: refreshTokenPayload,
          privateKey: 'refresh_token_secret',
          options: refreshTokenPayload.exp ? undefined : { expiresIn: '100d' }
        })
      ])

      expect(jwtUtils.signToken).toHaveBeenCalledWith({
        payload: accessTokenpayload,
        privateKey: 'access_token_secret',
        options: { expiresIn: '1h' }
      })
      expect(access_token).toBe('mock.jwt.token')

      expect(jwtUtils.signToken).toHaveBeenCalledWith({
        payload: refreshTokenPayload,
        privateKey: 'refresh_token_secret',
        options: refreshTokenPayload.exp ? undefined : { expiresIn: '100d' }
      })
      expect(refresh_token).toBe('mock.jwt.token')

      expect({ access_token, refresh_token }).toEqual({
        access_token: 'mock.jwt.token',
        refresh_token: 'mock.jwt.token'
      })
    })
  })
})
