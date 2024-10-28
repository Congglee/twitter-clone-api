import { Router } from 'express'
import {
  changePasswordController,
  followController,
  getMeController,
  getProfileController,
  getRandomUsersController,
  unfollowController,
  updateMeController
} from '~/controllers/users.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import {
  changePasswordValidator,
  followValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/types/users.types'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - users
 *     summary: Get current user
 *     description: Get the profile of the currently authenticated user
 *     operationId: getCurrentUser
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get my profile successfully
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * @swagger
 * /users/me:
 *   patch:
 *     tags:
 *       - users
 *     summary: Update current user
 *     description: Update the profile of the currently authenticated user
 *     operationId: updateCurrentUser
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: User details to update
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMeBody'
 *     responses:
 *       '200':
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Update my profile successfully
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/UserNotVerifiedError'
 *       '422':
 *         description: Validation error
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * @swagger
 * /users/random:
 *   get:
 *     tags:
 *       - users
 *     summary: Get random users
 *     description: Retrieve a list of random users for the currently authenticated user to follow
 *     operationId: getRandomUsers
 *     security:
 *       - BearerAuth: []
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
 *         description: Random users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get random users successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
 *       '422':
 *         description: Validation error
 */
usersRouter.get('/random', accessTokenValidator, paginationValidator, wrapRequestHandler(getRandomUsersController))

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     tags:
 *       - users
 *     summary: Get user profile
 *     description: Get the profile of a user by their username
 *     operationId: getUserProfile
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: chelsea1
 *         description: The username of the user whose profile is to be retrieved
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get profile successfully
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       '404':
 *         $ref: '#/components/responses/UserNotFoundError'
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileController))

/**
 * @swagger
 * /users/follow:
 *   post:
 *     tags:
 *       - users
 *     summary: Follow user
 *     description: Follow a user by their username
 *     operationId: followUser
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: User to follow
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followed_user_id:
 *                 type: string
 *                 format: uuid
 *                 example: 9b1ba69d-260c-49f2-ad84-e02c932823cb
 *     responses:
 *       '200':
 *         description: User followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               followSuccessfully:
 *                 summary: Follow successfully
 *                 value:
 *                   message: Follow successfully
 *               followed:
 *                 summary: Followed
 *                 value:
 *                   message: Followed
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
 *               invalidFollowedUserId:
 *                 summary: Invalid followed user id
 *                 value:
 *                   message: Invalid followed user id
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 * @swagger
 * /users/{user_id}:
 *   delete:
 *     tags:
 *       - users
 *     summary: Unfollow user
 *     description: Unfollow a user by their user ID
 *     operationId: unfollowUser
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 9b1ba69d-260c-49f2-ad84-e02c932823cb
 *         description: The user ID of the user to unfollow
 *     responses:
 *       '200':
 *         description: User unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               unfollowSuccessfully:
 *                 summary: Unfollow successfully
 *                 value:
 *                   message: Unfollow successfully
 *               alreadyUnfollowed:
 *                 summary: Already unfollowed
 *                 value:
 *                   message: Already unfollowed
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
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
)

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     tags:
 *       - users
 *     summary: Change password
 *     description: Change the password of the currently authenticated user
 *     operationId: changePassword
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: New password to change
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_password:
 *                 type: string
 *                 format: password
 *                 example: Test@123
 *               new_password:
 *                 type: string
 *                 format: password
 *                 example: Test@1234
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: Test@1234
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Change password successfully
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               accessTokenRequired:
 *                 summary: Access token is required
 *                 value:
 *                   message: Access token is required
 *               refreshTokenRequired:
 *                 summary: Refresh token is required
 *                 value:
 *                   message: Refresh token is required
 *               usedRefreshTokenOrNotExists:
 *                 summary: Used refresh token or not exist
 *                 value:
 *                   message: Used refresh token or not exist
 *               jwtExpired:
 *                 summary: Jwt expired
 *                 value:
 *                   message: Jwt expired
 *               oldPasswordNotMatch:
 *                 summary: Old password not match
 *                 value:
 *                   message: Old password not match
 *       '403':
 *         $ref: '#/components/responses/UserNotVerifiedError'
 *       '404':
 *         $ref: '#/components/responses/UserNotFoundError'
 *       '422':
 *         description: Validation error
 */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
