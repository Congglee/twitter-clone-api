import prisma from '~/client'

class NotificationService {
  async getNotifications({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const where = { userId: user_id }

    const notifications = await prisma.notification.findMany({
      where,
      skip: limit * (page - 1),
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    const total = await prisma.notification.count({ where })

    return { notifications, total }
  }
}

const notificationService = new NotificationService()
export default notificationService
