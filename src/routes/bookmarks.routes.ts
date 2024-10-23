import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 * @swagger
 * /bookmarks:
 *   post:
 *     tags:
 *       - bookmarks
 *     summary: Bookmark tweet
 *     description: Bookmark a tweet by its ID
 *     operationId: bookmarkTweet
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Tweet to bookmark
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
 *         description: Tweet bookmarked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bookmark successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 5d4b7513-9d81-48dd-9437-76187f88c259
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
bookmarksRouter.post(
  '',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
)

/**
 * @swagger
 * /bookmarks/tweets/{tweet_id}:
 *   delete:
 *     tags:
 *       - bookmarks
 *     summary: Unbookmark tweet
 *     description: Unbookmark a tweet by its ID
 *     operationId: unbookmarkTweet
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
 *         description: The ID of the tweet to unbookmark
 *     responses:
 *       '200':
 *         description: Tweet unbookmarked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unbookmark successfully
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
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

export default bookmarksRouter
