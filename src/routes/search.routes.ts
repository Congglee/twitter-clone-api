import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { searchValidator } from '~/middlewares/search.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { verifiedUserValidator } from '~/middlewares/users.middlewares'

const searchRouter = Router()

/**
 * @swagger
 * /search:
 *   get:
 *     tags:
 *       - search
 *     summary: Advanced search for tweets
 *     description: Advanced search for tweets
 *     operationId: search
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: content
 *         in: query
 *         schema:
 *           type: string
 *           example: Comes
 *         description: The content to search for in tweets
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
 *       - name: media_type
 *         in: query
 *         schema:
 *           type: string
 *           enum:
 *             - image
 *             - video
 *           example: image
 *       - name: people_follow
 *         in: query
 *         schema:
 *           type: string
 *           enum:
 *             - '0'
 *             - '1'
 *           example: '1'
 *         description: '0: Anyone, 1: Following'
 *     responses:
 *       '200':
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Search successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     tweets:
 *                       type: array
 *                       items:
 *                         oneOf:
 *                           - $ref: '#/components/schemas/SearchTweet'
 *                           - $ref: '#/components/schemas/SearchRetweet'
 *                           - $ref: '#/components/schemas/SearchComment'
 *                           - $ref: '#/components/schemas/SearchQuoteTweet'
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
 *       '422':
 *         description: Validation error
 */
searchRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  searchValidator,
  paginationValidator,
  searchController
)

export default searchRouter
