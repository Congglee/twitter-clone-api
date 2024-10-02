import { Router } from 'express'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  OAuthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/auth.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/auth.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const authRouter = Router()

authRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

authRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

authRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

authRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

authRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

authRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

authRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

authRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

authRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

authRouter.get('/oauth/google', wrapRequestHandler(OAuthController))

export default authRouter
