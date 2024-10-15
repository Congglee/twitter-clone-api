import { Request } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import HTTP_STATUS from '~/config/httpStatus'
import { AUTH_MESSAGES } from '~/config/messages'
import { ErrorWithStatus } from '~/types/errors.types'
import { verifyToken } from '~/utils/jwt'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const enumToPrismaArray = (enumObj: { [key: string]: string | number }) => {
  return Object.keys(enumObj).filter((key) => isNaN(Number(key)))
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
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

    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }

    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
}
