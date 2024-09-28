import { UserVerifyStatus } from '@prisma/client'
import prisma from '~/client'
import { TokenType } from '~/config/enums'
import { AUTH_MESSAGES } from '~/config/messages'
import { RegisterReqBody } from '~/types/requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'

class AuthService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken, verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    })
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken, verify },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN }
    })
  }
  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }
  async checkEmailExist(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    return Boolean(user)
  }
  async register(payload: RegisterReqBody) {
    const result = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        username: `user_${Date.now()}`,
        dateOfBirth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      }
    })
    const user_id = result.id

    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    await prisma.refreshToken.create({ data: { userId: user_id, token: refresh_token } })

    console.log('email_verify_token: ', email_verify_token)

    return { access_token, refresh_token }
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
    await prisma.refreshToken.create({
      data: { userId: user_id, token: refresh_token }
    })

    return { access_token, refresh_token }
  }
  async logout(refresh_token: string) {
    await prisma.refreshToken.delete({ where: { token: refresh_token } })

    return { message: AUTH_MESSAGES.LOGOUT_SUCCESS }
  }
  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      await prisma.user.update({
        where: { id: user_id },
        data: { emailVerifyToken: '', verify: UserVerifyStatus.Verified }
      })
    ])
    const [access_token, refresh_token] = token

    return { access_token, refresh_token }
  }
  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    console.log('Resend verify email: ', email_verify_token)

    await prisma.user.update({
      where: { id: user_id },
      data: { emailVerifyToken: email_verify_token }
    })

    return { message: AUTH_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS }
  }
  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    await prisma.user.update({
      where: { id: user_id },
      data: { forgotPasswordToken: forgot_password_token }
    })

    console.log('forgot_password_token: ', forgot_password_token)

    return { message: AUTH_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD }
  }
  async resetPassword(user_id: string, password: string) {
    await prisma.user.update({
      where: { id: user_id },
      data: { forgotPasswordToken: '', password: hashPassword(password) }
    })

    return { message: AUTH_MESSAGES.RESET_PASSWORD_SUCCESS }
  }
}

const authService = new AuthService()
export default authService
