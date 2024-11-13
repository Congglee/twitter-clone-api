import { describe, test, expect } from '@jest/globals'
import { signToken, verifyToken } from '~/utils/jwt'

describe('JWT Unit Tests', () => {
  const payload = { user_id: 'test_user_id', token_type: 0, verify: 'Verified' }
  const privateKey = 'test_secret_key'

  test('should generate valid JWT token', async () => {
    const token = await signToken({
      payload,
      privateKey
    })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  test('should generate token with custom options', async () => {
    const token = await signToken({
      payload,
      privateKey,
      options: {
        algorithm: 'HS256',
        expiresIn: '1d'
      }
    })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  test('should reject with invalid privateKey', async () => {
    // Use await `expect().rejects.toThrow()` to test for rejected promises
    await expect(signToken({ payload, privateKey: '' })).rejects.toThrow()
  })

  test('should verify valid token', async () => {
    const token = await signToken({ payload, privateKey })
    const decoded = await verifyToken({ token, secretOrPublicKey: privateKey })
    // Using `toMatchObject` to compare objects with partial match instead of `toEqual`
    expect(decoded).toMatchObject(payload)
  })

  test('should reject with invalid token', async () => {
    await expect(
      verifyToken({
        token: 'invalid.token.here',
        secretOrPublicKey: privateKey
      })
    ).rejects.toThrow()
  })

  test('should reject with invalid secret key', async () => {
    const token = await signToken({ payload, privateKey })
    await expect(
      verifyToken({
        token,
        secretOrPublicKey: 'wrong_secret'
      })
    ).rejects.toThrow()
  })
})
