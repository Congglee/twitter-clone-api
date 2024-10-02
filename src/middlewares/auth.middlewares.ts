import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import prisma from '~/client'
import HTTP_STATUS from '~/config/httpStatus'
import { AUTH_MESSAGES } from '~/config/messages'
import authService from '~/services/auth.services'
import { ErrorWithStatus } from '~/types/errors'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const passwordSchema: ParamSchema = {
  notEmpty: { errorMessage: AUTH_MESSAGES.PASSWORD_IS_REQUIRED },
  isString: { errorMessage: AUTH_MESSAGES.PASSWORD_MUST_BE_STRING },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: AUTH_MESSAGES.PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50
  },
  isStrongPassword: {
    options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    errorMessage: AUTH_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

export const confirmPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: AUTH_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED },
  isString: { errorMessage: AUTH_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: AUTH_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50
  },
  isStrongPassword: {
    options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    errorMessage: AUTH_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(AUTH_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: AUTH_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await prisma.user.findUnique({ where: { id: user_id } })
        if (user === null) {
          throw new ErrorWithStatus({
            message: AUTH_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        if (user.forgotPasswordToken !== value) {
          throw new ErrorWithStatus({
            message: AUTH_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: capitalize(error.message),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}

export const nameSchema: ParamSchema = {
  notEmpty: { errorMessage: AUTH_MESSAGES.NAME_IS_REQUIRED },
  isString: { errorMessage: AUTH_MESSAGES.NAME_MUST_BE_STRING },
  trim: true,
  isLength: {
    options: { min: 1, max: 100 },
    errorMessage: AUTH_MESSAGES.NAME_LENGTH_MUST_BE_BETWEEN_1_AND_100
  }
}

export const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: { strict: true, strictSeparator: true },
    errorMessage: AUTH_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: { errorMessage: AUTH_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await prisma.user.findUnique({
              where: {
                email: value,
                password: hashPassword(req.body.password)
              }
            })
            if (user === null) {
              throw new Error(AUTH_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: { errorMessage: AUTH_MESSAGES.PASSWORD_IS_REQUIRED },
        isString: { errorMessage: AUTH_MESSAGES.PASSWORD_MUST_BE_STRING },
        isLength: {
          options: { min: 6, max: 50 },
          errorMessage: AUTH_MESSAGES.PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50
        },
        isStrongPassword: {
          options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
          errorMessage: AUTH_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: { errorMessage: AUTH_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await authService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: AUTH_MESSAGES.ACCESS_TOKEN_IS_REQUIRED },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                prisma.refreshToken.findUnique({ where: { token: value } })
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: AUTH_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: { errorMessage: AUTH_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await prisma.user.findUnique({ where: { email: value } })
            if (user === null) {
              throw new Error(AUTH_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema({ forgot_password_token: forgotPasswordTokenSchema }, ['body'])
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)
