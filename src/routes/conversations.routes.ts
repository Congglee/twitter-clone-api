import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { getConversationsValidator } from '~/middlewares/conversations.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { verifiedUserValidator } from '~/middlewares/users.middlewares'

const conversationsRouter = Router()

/**
 * @swagger
 * /conversations/receivers/{receiver_id}:
 *   get:
 *     tags:
 *       - conversations
 *     summary: Get conversation by receiver ID
 *     description: Get a conversation by the receiver ID
 *     operationId: getConversation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: receiver_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 04e8de3b-2537-4758-86d0-4c6d9ca47153
 *         description: The ID of the receiver to retrieve conversation
 *       - name: limit
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: page
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Conversation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get conversations successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     conversations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Conversation'
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
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   message: User not found
 *               invalidUserId:
 *                 summary: Invalid user id
 *                 value:
 *                   message: Invalid user id
 *       '422':
 *         description: Validation error
 */
conversationsRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationsValidator,
  getConversationsController
)

export default conversationsRouter
