import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import bookmarkService from '~/services/bookmarks.services'
import { BOOKMARKS_MESSAGES } from '~/config/messages'
import { TokenPayload } from '~/types/users.types'
import { BookmarkTweetRequestBody } from '~/types/bookmarks.types'
import { TweetType } from '@prisma/client'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet({
    user_id,
    tweet_id: req.body.tweet_id,
    tweet_type: req.tweet?.type as TweetType,
    parent_id: req.tweet?.parentId
  })

  return res.json({ message: BOOKMARKS_MESSAGES.BOOKMARK_SUCCESSFULLY, result })
}

export const unbookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await bookmarkService.unbookmarkTweet(user_id, req.params.tweet_id)

  return res.json({ message: BOOKMARKS_MESSAGES.UNBOOKMARK_SUCCESSFULLY })
}
