import { Router } from 'express'
import { likeTweetController, unlikeTweetController } from '~/controllers/likes.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

/**
 * @swagger
 * /likes:
 *   post:
 *     tags:
 *       - likes
 *     summary: Like tweet
 *     description: Like a tweet by its ID
 *     operationId: likeTweet
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Tweet to like
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tweet_id:
 *                 type: string
 *                 format: uuid
 *                 example: 8996728b-ea6c-473d-8a61-150ddb787d6b
 *     responses:
 *       '200':
 *         description: Tweet liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Like successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 486bccdb-8b52-4029-a79c-a61a6e5aaac4
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       example: 9b1ba69d-260c-49f2-ad84-e02c932823cb
 *                     tweetId:
 *                       type: string
 *                       format: uuid
 *                       example: 8996728b-ea6c-473d-8a61-150ddb787d6b
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2021-01-01T17:54:04.262Z
 *       '400':
 *         description: Invalid tweet ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid tweet id
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/UserNotVerifiedError'
 *       '404':
 *         description: Tweet not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tweet not found
 */
likesRouter.post(
  '',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)

/**
 * @swagger
 * /likes/tweets/{tweet_id}:
 *   delete:
 *     tags:
 *       - likes
 *     summary: Unlike tweet
 *     description: Unlike a tweet by its ID
 *     operationId: unlikeTweet
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: tweet_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 8996728b-ea6c-473d-8a61-150ddb787d6b
 *         description: The ID of the tweet to unlike
 *     responses:
 *       '200':
 *         description: Tweet unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unlike successfully
 *       '400':
 *         description: Invalid tweet ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid tweet id
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/UserNotVerifiedError'
 *       '404':
 *         description: Tweet not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tweet not found
 */
likesRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unlikeTweetController)
)

export default likesRouter
