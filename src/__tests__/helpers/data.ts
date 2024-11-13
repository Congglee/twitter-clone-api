import { User, RefreshToken, UserVerifyStatus } from '@prisma/client'
import * as cryptoUtils from '~/utils/crypto'

jest.spyOn(cryptoUtils, 'hashPassword').mockImplementation((password) => {
  return `${password}_hashed`
})

export const createMockUser = (overrides: Partial<User> = {}): User => {
  const userId = 'test_user_id'
  const hashedPassword = cryptoUtils.hashPassword(overrides.password || 'Test@1234_hashed')

  return {
    id: userId,
    name: overrides.name || 'Test User',
    email: overrides.email || 'test@example.com',
    username: `user${userId}`,
    emailVerifyToken: 'test_email_verify_token',
    verify: UserVerifyStatus.Unverified,
    dateOfBirth: new Date(overrides.dateOfBirth || new Date()),
    password: hashedPassword,
    forgotPasswordToken: '',
    createdAt: new Date(),
    updatedAt: new Date()
  } as User
}

export const createMockRefreshToken = (overrides: Partial<RefreshToken> = {}): RefreshToken => {
  const refresh_token_id = 'test_refresh_token_id'

  return {
    id: refresh_token_id,
    userId: overrides.userId || 'test_user_id',
    token: overrides.token || 'test_refresh_token',
    iat: overrides.iat || new Date(Date.now() * 1000),
    exp: overrides.exp || new Date(Date.now() * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  } as RefreshToken
}
