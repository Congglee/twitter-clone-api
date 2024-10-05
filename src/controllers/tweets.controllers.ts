import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { TweetRequestBody } from '~/types/tweets.requests'
import { TokenPayload } from '~/types/users.requests'
import tweetsService from '~/services/tweets.services'
import { TWEETS_MESSAGES } from '~/config/messages'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)

  return res.json({ message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESS, data: result })
}
