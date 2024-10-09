import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

bookmarksRouter.post('', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(bookmarkTweetController))

bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

export default bookmarksRouter
