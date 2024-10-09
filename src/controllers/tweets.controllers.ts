import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { TweetRequestBody } from '~/types/tweets.types'
import { TokenPayload } from '~/types/users.types'
import tweetsService from '~/services/tweets.services'
import { TWEETS_MESSAGES } from '~/config/messages'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)

  return res.json({ message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESS, result })
}

export const getTweetController = async (req: Request, res: Response) => {
  const result = await tweetsService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  const tweet = {
    ...req.tweet,
    guestViews: result.guestViews,
    userViews: result.userViews,
    views: result.guestViews + result.userViews
  }

  return res.json({ message: TWEETS_MESSAGES.GET_TWEET_DETAIL_SUCCESS, result: tweet })
}
