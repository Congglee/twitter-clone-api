import { Router } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweets.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { audienceValidator, createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

export default tweetsRouter
