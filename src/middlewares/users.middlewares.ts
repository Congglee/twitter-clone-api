import { UserVerifyStatus } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import HTTP_STATUS from '~/config/httpStatus'
import { AUTH_MESSAGES, USERS_MESSAGES } from '~/config/messages'
import { confirmPasswordSchema, dateOfBirthSchema, nameSchema, passwordSchema } from '~/middlewares/auth.middlewares'
import { ErrorWithStatus } from '~/types/errors.types'
import { TokenPayload } from '~/types/users.types'
import { validate } from '~/utils/validation'
import { validate as uuidValidate } from 'uuid'
import prisma from '~/client'
import { REGEX_USERNAME } from '~/config/regex'
import { hashPassword } from '~/utils/crypto'

const imageSchema: ParamSchema = {
  optional: true,
  isString: { errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_STRING },
  trim: true,
  isLength: { options: { min: 1, max: 400 }, errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH }
}

export const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!uuidValidate(value)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.INVALID_USER_ID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const followed_user = await prisma.user.findUnique({ where: { id: value } })
      if (followed_user === null) {
        throw new ErrorWithStatus({
          message: AUTH_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: { ...nameSchema, optional: true, notEmpty: undefined },
      date_of_birth: { ...dateOfBirthSchema, optional: true },
      bio: {
        optional: true,
        isString: { errorMessage: USERS_MESSAGES.BIO_MUST_BE_STRING },
        trim: true,
        isLength: { options: { min: 1, max: 200 }, errorMessage: USERS_MESSAGES.BIO_LENGTH }
      },
      location: {
        optional: true,
        isString: { errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_STRING },
        trim: true,
        isLength: { options: { min: 1, max: 200 }, errorMessage: USERS_MESSAGES.LOCATION_LENGTH }
      },
      website: {
        optional: true,
        isString: { errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_STRING },
        trim: true,
        isLength: { options: { min: 1, max: 200 }, errorMessage: USERS_MESSAGES.WEBSITE_LENGTH }
      },
      username: {
        optional: true,
        isString: { errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_STRING },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw Error(USERS_MESSAGES.USERNAME_INVALID)
            }
            const user = await prisma.user.findFirst({ where: { username: value } })
            if (user) {
              throw Error(USERS_MESSAGES.USERNAME_EXISTED)
            }
          }
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)

export const followValidator = validate(checkSchema({ followed_user_id: userIdSchema }, ['body']))

export const unfollowValidator = validate(checkSchema({ user_id: userIdSchema }, ['params']))

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decoded_authorization as TokenPayload
            const user = await prisma.user.findUnique({ where: { id: user_id } })
            if (!user) {
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const { password } = user
            const isMatch = hashPassword(value) === password
            if (!isMatch) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }
}
