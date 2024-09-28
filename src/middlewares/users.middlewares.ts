import { UserVerifyStatus } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import HTTP_STATUS from '~/config/httpStatus'
import { USERS_MESSAGES } from '~/config/messages'
import { dateOfBirthSchema, nameSchema } from '~/middlewares/auth.middlewares'
import { ErrorWithStatus } from '~/types/errors'
import { TokenPayload } from '~/types/requests'
import { validate } from '~/utils/validation'

const imageSchema: ParamSchema = {
  optional: true,
  isString: { errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_STRING },
  trim: true,
  isLength: { options: { min: 1, max: 400 }, errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH }
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
        isLength: { options: { min: 1, max: 50 }, errorMessage: USERS_MESSAGES.USERNAME_LENGTH }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)
