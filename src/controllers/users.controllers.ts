import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { USERS_MESSAGES } from '~/config/messages'
import usersService from '~/services/users.services'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  GetProfileReqParams,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody
} from '~/types/users.types'

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await usersService.getMe(user_id)

  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const user = await usersService.updateMe(user_id, body)

  return res.json({ message: USERS_MESSAGES.UPDATE_ME_SUCCESS, result: user })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response, next: NextFunction) => {
  const { username } = req.params
  const user = await usersService.getProfile(username)

  return res.json({ message: USERS_MESSAGES.GET_PROFILE_SUCCESS, result: user })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersService.follow(user_id, followed_user_id)

  return res.json(result)
}

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await usersService.unfollow(user_id, followed_user_id)

  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)

  return res.json(result)
}
