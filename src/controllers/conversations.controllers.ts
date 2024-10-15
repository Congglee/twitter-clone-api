import { Request, Response } from 'express'
import { CONVERSATION_MESSAGES } from '~/config/messages'
import conversationService from '~/services/conversations.services'
import { GetConversationsParams } from '~/types/conversations.types'

export const getConversationsController = async (req: Request<GetConversationsParams>, res: Response) => {
  const { receiver_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const sender_id = req.decoded_authorization?.user_id as string

  const result = await conversationService.getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  })

  return res.json({
    message: CONVERSATION_MESSAGES.GET_CONVERSATIONS_SUCCESSFULLY,
    result: {
      conversations: result.conversations,
      limit,
      page,
      total_pages: Math.ceil(result.total / limit)
    }
  })
}
