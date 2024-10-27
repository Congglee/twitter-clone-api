import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { Pagination, TweetParams, TweetQuery, TweetRequestBody } from '~/types/tweets.types'
import { TokenPayload } from '~/types/users.types'
import tweetsService from '~/services/tweets.services'
import { TWEETS_MESSAGES } from '~/config/messages'
import { TweetType } from '@prisma/client'

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

export const getTweetChildrenController = async (req: Request<TweetParams, any, any, TweetQuery>, res: Response) => {
  const tweet_type = req.query.tweet_type as TweetType
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id

  const { total, tweets } = await tweetsService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  })

  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESS,
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}

export const getNewFeedsController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const user_id = req.decoded_authorization?.user_id as string
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const result = await tweetsService.getNewFeeds({ user_id, limit, page })

  return res.json({
    message: TWEETS_MESSAGES.GET_NEW_FEEDS_SUCCESS,
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}

export const getBookmarkTweetsController = async (
  req: Request<ParamsDictionary, any, any, TweetQuery>,
  res: Response
) => {
  const user_id = req.decoded_authorization?.user_id as string
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const keyword = req.query.keyword

  const result = await tweetsService.getBookmarkTweets({ user_id, limit, page, keyword })

  return res.json({
    message: TWEETS_MESSAGES.GET_BOOKMARK_TWEETS_SUCCESS,
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}

export const getLikeTweetsController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const user_id = req.decoded_authorization?.user_id as string
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const result = await tweetsService.getLikeTweets({ user_id, limit, page })

  return res.json({
    message: TWEETS_MESSAGES.GET_LIKE_TWEETS_SUCCESS,
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
