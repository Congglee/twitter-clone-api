import { Router } from 'express'
import { getNotificationsController } from '~/controllers/notifications.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { verifiedUserValidator } from '~/middlewares/users.middlewares'

const notificationsRouter = Router()

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags:
 *       - notifications
 *     summary: Get notifications
 *     description: Get the list of notifications by the currently authenticated user
 *     operationId: getNotifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get notifications successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     total_page:
 *                       type: integer
 *                       example: 1
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/UserNotVerifiedError'
 */
notificationsRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getNotificationsController
)

export default notificationsRouter
