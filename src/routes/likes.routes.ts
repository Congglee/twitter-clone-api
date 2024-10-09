import { Router } from 'express'
import { likeTweetController, unlikeTweetController } from '~/controllers/likes.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

likesRouter.post(
  '',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)

likesRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unlikeTweetController)
)

export default likesRouter
