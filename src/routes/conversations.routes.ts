import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { getConversationsValidator } from '~/middlewares/conversations.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { verifiedUserValidator } from '~/middlewares/users.middlewares'

const conversationsRouter = Router()

conversationsRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationsValidator,
  getConversationsController
)

export default conversationsRouter
