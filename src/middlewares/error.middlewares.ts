import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/config/httpStatus'
import { ErrorWithStatus } from '~/types/errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }

  // const errorObject: any = {}
  // Object.getOwnPropertyNames(err).forEach((key) => {
  //   Object.defineProperty(err, key, { enumerable: true })
  // })

  Object.getOwnPropertyNames(err).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(err, key)
    if (descriptor && descriptor.configurable) {
      Object.defineProperty(err, key, { enumerable: true })
    }
  })

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, ['stack'])
  })
}
