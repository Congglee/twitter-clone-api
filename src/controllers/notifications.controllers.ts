import { Request, Response } from 'express'
import { NOTIFICATIONS_MESSAGES } from '~/config/messages'
import notificationService from '~/services/notifications.services'

export const getNotificationsController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id as string

  const result = await notificationService.getNotifications({
    user_id,
    limit,
    page
  })

  return res.json({
    message: NOTIFICATIONS_MESSAGES.GET_NOTIFICATIONS_SUCCESSFULLY,
    result: {
      notifications: result.notifications,
      limit,
      page,
      total_pages: Math.ceil(result.total / limit)
    }
  })
}
