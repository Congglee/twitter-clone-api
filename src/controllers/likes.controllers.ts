import { TweetType } from '@prisma/client'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LIKE_MESSAGES } from '~/config/messages'
import likeService from '~/services/likes.services'
import { LikeTweetReqBody } from '~/types/likes.types'
import { TokenPayload } from '~/types/users.types'

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await likeService.likeTweet({
    user_id,
    tweet_id: req.body.tweet_id,
    tweet_type: req.tweet?.type as TweetType,
    parent_id: req.tweet?.parentId
  })

  return res.json({ message: LIKE_MESSAGES.LIKE_SUCCESSFULLY, result })
}

export const unlikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await likeService.unlikeTweet(user_id, req.params.tweet_id)

  return res.json({ message: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY })
}
