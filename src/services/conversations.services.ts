import prisma from '~/client'

class ConversationService {
  async getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) {
    const where = {
      OR: [
        { senderId: sender_id, receiverId: receiver_id },
        { senderId: receiver_id, receiverId: sender_id }
      ]
    }

    const conversations = await prisma.conversation.findMany({
      where,
      skip: limit * (page - 1),
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    const total = await prisma.conversation.count({ where })

    return { conversations, total }
  }
}
const conversationService = new ConversationService()
export default conversationService
