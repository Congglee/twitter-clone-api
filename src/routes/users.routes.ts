import { Router } from 'express'
import {
  changePasswordController,
  followController,
  getMeController,
  getProfileController,
  unfollowController,
  updateMeController
} from '~/controllers/users.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  changePasswordValidator,
  followValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/types/requests'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

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

usersRouter.get('/:username', wrapRequestHandler(getProfileController))

usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
)

usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
