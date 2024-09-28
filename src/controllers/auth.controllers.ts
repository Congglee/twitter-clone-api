import { NextFunction, Request, Response } from 'express'
import authService from '~/services/auth.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/types/requests'
import { User, UserVerifyStatus } from '@prisma/client'
import { AUTH_MESSAGES } from '~/config/messages'
import HTTP_STATUS from '~/config/httpStatus'
import prisma from '~/client'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user.id
  const result = await authService.login({ user_id, verify: user.verify as UserVerifyStatus })

  return res.json({ message: AUTH_MESSAGES.LOGIN_SUCCESS, result })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await authService.register(req.body)

  return res.json({ message: AUTH_MESSAGES.REGISTER_SUCCESS, result })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await authService.logout(refresh_token)

  return res.json(result)
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await prisma.user.findUnique({ where: { id: user_id } })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: AUTH_MESSAGES.USER_NOT_FOUND
    })
  }

  if (user.emailVerifyToken === '') {
    return res.json({
      message: AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await authService.verifyEmail(user_id)

  return res.json({ message: AUTH_MESSAGES.EMAIL_VERIFY_SUCCESS, result })
}

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await prisma.user.findUnique({ where: { id: user_id } })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: AUTH_MESSAGES.USER_NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await authService.resendVerifyEmail(user_id)

  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { id, verify } = req.user as User
  const result = await authService.forgotPassword({ user_id: id, verify: verify as UserVerifyStatus })

  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({ message: AUTH_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await authService.resetPassword(user_id, password)

  return res.json(result)
}