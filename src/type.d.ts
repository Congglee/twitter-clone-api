import { User } from '@prisma/client'
import { Request } from 'express'
import { ExtendedTweet } from '~/types/tweets.types'
import { TokenPayload } from '~/types/users.types'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    tweet?: ExtendedTweet
  }
}
