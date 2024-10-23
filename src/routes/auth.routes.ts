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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Login user
 *     description: Login an existing user with email and password
 *     operationId: loginUser
 *     requestBody:
 *       description: User credentials to login
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successfully
 *                 result:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       '422':
 *         description: Validation error
 */
authRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - auth
 *     summary: Register a new user
 *     description: Register a new user with the provided details
 *     operationId: registerUser
 *     requestBody:
 *       description: User details to register
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterBody'
 *     responses:
 *       '200':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Register successfully
 *                 result:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       '422':
 *         description: Validation error
 */
authRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - auth
 *     summary: Logout user
 *     description: Logout the currently authenticated user
 *     operationId: logoutUser
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Refresh token to logout
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refresh_token:
 *                type: string
 *                example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOWIxYmE2OWQtMjYwYy00OWYyLWFkODQtZTAyYzkzMjgyM2NiIiwidG9rZW5fdHlwZSI6MSwidmVyaWZ5IjoiVmVyaWZpZWQiLCJpYXQiOjE3Mjk3MDA4MDAsImV4cCI6MTczODM0MDgwMH0.moY3R2r47yBHC_-0teMfSQZOvmQ3dSu0ir5qV2uL1po
 *       required: true
 *     responses:
 *       '200':
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successfully
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '422':
 *         description: Validation error
 */
authRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags:
 *       - auth
 *     summary: Refresh access token
 *     description: Refresh the access token using the refresh token
 *     operationId: refreshToken
 *     requestBody:
 *       description: Refresh token to generate new access token
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOWIxYmE2OWQtMjYwYy00OWYyLWFkODQtZTAyYzkzMjgyM2NiIiwidG9rZW5fdHlwZSI6MSwidmVyaWZ5IjoiVmVyaWZpZWQiLCJpYXQiOjE3Mjk3MDA4MDAsImV4cCI6MTczODM0MDgwMH0.moY3R2r47yBHC_-0teMfSQZOvmQ3dSu0ir5qV2uL1po
 *     responses:
 *       '200':
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refresh token successfully
 *                 result:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               refreshTokenRequired:
 *                 summary: Refresh token is required
 *                 value:
 *                   message: Refresh token is required
 *               usedRefreshTokenOrNotExists:
 *                 summary: Used refresh token or not exist
 *                 value:
 *                   message: Used refresh token or not exist
 *               jwtExpired:
 *                 summary: Jwt expired
 *                 value:
 *                   message: Jwt expired
 *               invalidSignature:
 *                 summary: Invalid signature
 *                 value:
 *                   message: Invalid signature
 *               jwtMalformed:
 *                 summary: Jwt malformed
 *                 value:
 *                   message: Jwt malformed
 */
authRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     tags:
 *       - auth
 *     summary: Verify email
 *     description: Verify the user's email using the verification token
 *     operationId: verifyEmail
 *     requestBody:
 *       description: Verification token to verify email
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_verify_token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDc2Nzk2MjEtNWRjNS00OGJmLWFmMGYtMzg0NzViNzAyNGRjIiwidG9rZW5fdHlwZSI6MywidmVyaWZ5IjoiVW52ZXJpZmllZCIsImlhdCI6MTcyOTY4MzcxNiwiZXhwIjoxNzI5NjkwOTE2fQ.QH8wociGh3AnCBxZtiAFYWoyCqFqA-dc6OfSncr21zU
 *     responses:
 *       '200':
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               emailAlreadyVerified:
 *                 summary: Email already verified before
 *                 value:
 *                   message: Email already verified before
 *               emailVerifiedSuccessfully:
 *                 summary: Email verified successfully
 *                 value:
 *                   message: Email verified successfully
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               emailVerifyTokenRequired:
 *                 summary: Email verify token is required
 *                 value:
 *                   message: Email verify token is required
 *               jwtExpired:
 *                 summary: Jwt expired
 *                 value:
 *                   message: Jwt expired
 *               invalidSignature:
 *                 summary: Invalid signature
 *                 value:
 *                   message: Invalid signature
 *               jwtMalformed:
 *                 summary: Jwt malformed
 *                 value:
 *                   message: Jwt malformed
 *       '404':
 *         $ref: '#/components/responses/UserNotFoundError'
 */
authRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * @swagger
 * /auth/resend-verify-email:
 *   post:
 *     tags:
 *       - auth
 *     summary: Resend verify email
 *     description: Resend the verification email to the user's email
 *     operationId: resendVerifyEmail
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent successfully
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */
authRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - auth
 *     summary: Forgot password
 *     description: Send a password reset email to the user's email
 *     operationId: forgotPassword
 *     requestBody:
 *       description: User email to send password reset email
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: Eldridge.Dietrich@hotmail.com
 *     responses:
 *       '200':
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Check your email to reset password
 *       '422':
 *         description: Validation error
 */
authRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * @swagger
 * /auth/verify-forgot-password:
 *   post:
 *     tags:
 *       - auth
 *     summary: Verify forgot password
 *     description: Verify the user's forgot password token
 *     operationId: verifyForgotPassword
 *     requestBody:
 *       description: Forgot password token to verify
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               forgot_password_token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTQ5YTE2ZWItMmNkYy00OWQzLThkNjMtN2E2MTM5NGNhMTI3IiwidG9rZW5fdHlwZSI6MiwidmVyaWZ5IjoiVmVyaWZpZWQiLCJpYXQiOjE3Mjc1MTk1NTIsImV4cCI6MTcyODEyNDM1Mn0.RJDWDTt_7h_3mEgItoD4If35luM7XTWsjmkZMi8c7jw
 *     responses:
 *       '200':
 *         description: Forgot password token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verify forgot password successfully
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               forgotPasswordTokenRequired:
 *                 summary: Forgot password token is required
 *                 value:
 *                   message: Forgot password token is required
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   message: User not found
 *               invalidForgotPasswordToken:
 *                 summary: Invalid forgot password token
 *                 value:
 *                   message: Invalid forgot password token
 *               jwtExpired:
 *                 summary: Jwt expired
 *                 value:
 *                   message: Jwt expired
 *               invalidSignature:
 *                 summary: Invalid signature
 *                 value:
 *                   message: Invalid signature
 *               jwtMalformed:
 *                 summary: Jwt malformed
 *                 value:
 *                   message: Jwt malformed
 */
authRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - auth
 *     summary: Reset password
 *     description: Reset the user's password using the forgot password token
 *     operationId: resetPassword
 *     requestBody:
 *       description: New password to reset
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               forgot_password_token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTQ5YTE2ZWItMmNkYy00OWQzLThkNjMtN2E2MTM5NGNhMTI3IiwidG9rZW5fdHlwZSI6MiwidmVyaWZ5IjoiVmVyaWZpZWQiLCJpYXQiOjE3Mjc1MTk1NTIsImV4cCI6MTcyODEyNDM1Mn0.RJDWDTt_7h_3mEgItoD4If35luM7XTWsjmkZMi8c7jw
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Test@123
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: Test@123
 *     responses:
 *       '200':
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset password successfully
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               forgotPasswordTokenRequired:
 *                 summary: Forgot password token is required
 *                 value:
 *                   message: Forgot password token is required
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   message: User not found
 *               invalidForgotPasswordToken:
 *                 summary: Invalid forgot password token
 *                 value:
 *                   message: Invalid forgot password token
 *               jwtExpired:
 *                 summary: Jwt expired
 *                 value:
 *                   message: Jwt expired
 *               invalidSignature:
 *                 summary: Invalid signature
 *                 value:
 *                   message: Invalid signature
 *               jwtMalformed:
 *                 summary: Jwt malformed
 *                 value:
 *                   message: Jwt malformed
 *       '422':
 *         description: Validation error
 */
authRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * @swagger
 * /auth/oauth/google:
 *   get:
 *     tags:
 *       - auth
 *     summary: OAuth with Google
 *     description: Authenticate the user using Google OAuth
 *     operationId: OAuthGoogle
 *     parameters:
 *       - name: code
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: 4/0AX4XfWgq...z3Q
 *         description: The authorization code returned by Google OAuth
 *     responses:
 *       '302':
 *         description: Redirect to the client with access and refresh tokens
 *         headers:
 *           Location:
 *             description: The URL to redirect the client to
 *             schema:
 *               type: string
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gmail not verified
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
authRouter.get('/oauth/google', wrapRequestHandler(OAuthController))

export default authRouter
