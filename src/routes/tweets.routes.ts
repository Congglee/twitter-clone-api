import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * @swagger
 * /tweets:
 *   post:
 *     tags:
 *       - tweets
 *     summary: Create tweet
 *     description: Create a new tweet with the provided details
 *     operationId: createTweet
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Tweet details to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTweetBody'
 *     responses:
 *       '200':
 *         description: Tweet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Create tweet successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 8996728b-ea6c-473d-8a61-150ddb787d6b
 *                     type:
 *                       $ref: '#/components/schemas/TweetType'
 *                     audience:
 *                       $ref: '#/components/schemas/TweetAudience'
 *                     content:
 *                       type: string
 *                       example: Color decretum deprimo suggero ipsa facilis damno esse approbo. Natus taedium quaerat placeat attonbitus cribro repellat uter contabesco. Aranea tenax traho absens aeger ultra adnuo. Auxilium vergo est. Dolorum id terga coruscus. Dolores antepono thorax. Accommodo timor antepono sed terga. Bibo contra cariosus utilis apud. Calcar adduco viriliter ustilo cunabula tremo tendo. Theca tantum voco voluptas fugiat cometes. Charisma alienus bis conatus volutabrum maxime combibo caveo ara. Vigilo quo dicta ex vapulus. Copiose benigne defendo amoveo valetudo. Patruus contego desparatus quis coma amaritudo molestias tabesco depopulo adulescens. Cursus quod comminor vulnero consectetur cariosus pectus. Eligendi aetas defleo bardus cunabula. Studio demulceo currus explicabo. Deputo cur error caute triumphus. Atavus amiculum cohaero tero deserunt arguo. Quibusdam avarus placeat amita.
 *                     guestViews:
 *                       type: integer
 *                       example: 0
 *                     userViews:
 *                       type: integer
 *                       example: 0
 *                     parentId:
 *                       type: string
 *                       format: uuid
 *                       example: null
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       example: 9b1ba69d-260c-49f2-ad84-e02c932823cb
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2021-01-012024-10-15T18:55:58.417Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2021-01-01T18:55:58.417Z
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
 *               parentTweetNotFound:
 *                 summary: Parent tweet not found
 *                 value:
 *                   message: Parent tweet not found
 *               mentionsNotFound:
 *                 summary: Mention users not found
 *                 value:
 *                   message: Mention users not found
 *       '422':
 *         description: Validation error
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * @swagger
 * /tweets/{tweet_id}:
 *   get:
 *     tags:
 *       - tweets
 *     summary: Get tweet details by ID
 *     description: Get a tweet details by its ID
 *     operationId: getTweet
 *     parameters:
 *       - name: tweet_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 8996728b-ea6c-473d-8a61-150ddb787d6b
 *         description: The ID of the tweet to retrieve
 *     responses:
 *       '200':
 *         description: Tweet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get tweet detail successfully
 *                 result:
 *                   $ref: '#/components/schemas/Tweet'
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
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               userNotVerified:
 *                 summary: User not verified
 *                 value:
 *                   message: User not verified
 *               tweetIsNotPublic:
 *                 summary: Tweet is not public
 *                 value:
 *                   message: Tweet is not public
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               tweetNotFound:
 *                 summary: Tweet not found
 *                 value:
 *                   message: Tweet not found
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   message: User not found
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

/**
 * @swagger
 * /tweets/{tweet_id}/children:
 *   get:
 *     tags:
 *       - tweets
 *     summary: Get tweet children
 *     description: Get the children tweets of a tweet by its ID
 *     operationId: getTweetChildren
 *     parameters:
 *       - name: tweet_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 8996728b-ea6c-473d-8a61-150ddb787d6b
 *         description: The ID of the tweet to retrieve children
 *       - name: tweet_type
 *         in: query
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/TweetType'
 *       - name: page
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       '200':
 *         description: Tweet children retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get tweet children successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     tweets:
 *                       type: array
 *                       items:
 *                         oneOf:
 *                           - $ref: '#/components/schemas/Retweet'
 *                           - $ref: '#/components/schemas/Comment'
 *                           - $ref: '#/components/schemas/QuoteTweet'
 *                     tweet_type:
 *                       type: string
 *                       enum: [Tweet, Retweet, Comment, QuoteTweet]
 *                       example: Retweet
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     total_page:
 *                       type: integer
 *                       example: 1
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
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               userNotVerified:
 *                 summary: User not verified
 *                 value:
 *                   message: User not verified
 *               tweetIsNotPublic:
 *                 summary: Tweet is not public
 *                 value:
 *                   message: Tweet is not public
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               tweetNotFound:
 *                 summary: Tweet not found
 *                 value:
 *                   message: Tweet not found
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   message: User not found
 *       '422':
 *         description: Validation error
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  getTweetChildrenValidator,
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)

/**
 * @swagger
 * /tweets:
 *   get:
 *     tags:
 *       - tweets
 *     summary: Get new feeds
 *     description: Get the new feeds of the currently authenticated user
 *     security:
 *       - BearerAuth: []
 *     operationId: getNewFeeds
 *     parameters:
 *       - name: page
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       '200':
 *         description: Tweets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get new feeds successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     tweets:
 *                       type: array
 *                       items:
 *                         oneOf:
 *                           - $ref: '#/components/schemas/Tweet'
 *                           - $ref: '#/components/schemas/Retweet'
 *                           - $ref: '#/components/schemas/Comment'
 *                           - $ref: '#/components/schemas/QuoteTweet'
 *                     limit:
 *                       type: integer
 *                       example: 20
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
tweetsRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedsController)
)

export default tweetsRouter
