import { UserVerifyStatus } from '@prisma/client'
import axios from 'axios'
import prisma from '~/client'
import { TokenType } from '~/config/enums'
import HTTP_STATUS from '~/config/httpStatus'
import { AUTH_MESSAGES } from '~/config/messages'
import { ErrorWithStatus } from '~/types/errors.types'
import { RegisterReqBody } from '~/types/users.types'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { v4 as uuidv4 } from 'uuid'
import { sendForgotPasswordEmail, sendVerifyRegisterEmail } from '~/utils/mail'
import { envConfig } from '~/config/config'

class AuthService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      privateKey: envConfig.jwtSecretAccessToken,
      options: { expiresIn: envConfig.accessTokenExpiresIn }
    })
  }
  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken, verify, exp },
        privateKey: envConfig.jwtSecretRefreshToken
      })
    }

    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken, verify },
      privateKey: envConfig.jwtSecretRefreshToken,
      options: { expiresIn: envConfig.refreshTokenExpiresIn }
    })
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: envConfig.jwtSecretEmailVerifyToken,
      options: { expiresIn: envConfig.emailVerifyTokenExpiresIn }
    })
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken, verify },
      privateKey: envConfig.jwtSecretForgotPasswordToken,
      options: { expiresIn: envConfig.forgotPasswordTokenExpiresIn }
    })
  }
  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }
  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify }),
      prisma.refreshToken.deleteMany({ where: { token: refresh_token } })
    ])
    const decoded_refresh_token = await this.decodeRefreshToken(new_refresh_token)
    await prisma.refreshToken.create({
      data: {
        userId: user_id,
        token: new_refresh_token,
        iat: new Date(decoded_refresh_token.iat * 1000),
        exp: new Date(decoded_refresh_token.exp * 1000)
      }
    })

    return { access_token: new_access_token, refresh_token: new_refresh_token }
  }
  async checkEmailExist(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    return Boolean(user)
  }
  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: envConfig.googleClientId,
      client_secret: envConfig.googleClientSecret,
      redirect_uri: envConfig.googleRedirectUri,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as { access_token: string; id_token: string }
  }
  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: { access_token, alt: 'json' },
      headers: { Authorization: `Bearer ${id_token}` }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({ token: refresh_token, secretOrPublicKey: envConfig.jwtSecretRefreshToken })
  }
  async register(payload: RegisterReqBody) {
    const user_id = uuidv4()
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })

    await prisma.user.create({
      data: {
        id: user_id,
        name: payload.name,
        email: payload.email,
        username: `user${user_id}`,
        emailVerifyToken: email_verify_token,
        dateOfBirth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      }
    })

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await prisma.refreshToken.create({
      data: {
        userId: user_id,
        token: refresh_token,
        iat: new Date(iat * 1000),
        exp: new Date(exp * 1000)
      }
    })
    await sendVerifyRegisterEmail(payload.email, email_verify_token)

    return { access_token, refresh_token }
  }
  async OAuth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({ message: AUTH_MESSAGES.GMAIL_NOT_VERIFIED, status: HTTP_STATUS.BAD_REQUEST })
    }

    const user = await prisma.user.findUnique({ where: { email: userInfo.email } })
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user.id,
        verify: UserVerifyStatus.Verified
      })
      const { iat, exp } = await this.decodeRefreshToken(refresh_token)
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refresh_token,
          iat: new Date(iat * 1000),
          exp: new Date(exp * 1000)
        }
      })

      return { access_token, refresh_token, newUser: 0, verify: user.verify }
    } else {
      const password = Math.random().toString(36).substring(2, 15)
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password
      })

      return { ...data, newUser: 1, verify: UserVerifyStatus.Unverified }
    }
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await prisma.refreshToken.create({
      data: {
        userId: user_id,
        token: refresh_token,
        iat: new Date(iat * 1000),
        exp: new Date(exp * 1000)
      }
    })

    return { access_token, refresh_token }
  }
  async logout(refresh_token: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refresh_token } })
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
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await prisma.refreshToken.create({
      data: {
        userId: user_id,
        token: refresh_token,
        iat: new Date(iat * 1000),
        exp: new Date(exp * 1000)
      }
    })

    return { access_token, refresh_token }
  }
  async resendVerifyEmail(user_id: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    await sendVerifyRegisterEmail(email, email_verify_token)
    await prisma.user.update({
      where: { id: user_id },
      data: { emailVerifyToken: email_verify_token }
    })

    return { message: AUTH_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS }
  }
  async forgotPassword({
    user_id,
    email,
    verify,
    username
  }: {
    user_id: string
    email: string
    verify: UserVerifyStatus
    username: string
  }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    await prisma.user.update({
      where: { id: user_id },
      data: { forgotPasswordToken: forgot_password_token }
    })
    await sendForgotPasswordEmail(email, forgot_password_token, username)

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
