import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType, TweetAudience, Media, User, Tweet, HashTag } from '@prisma/client'

export type TweetMedia = Pick<Media, 'url' | 'type'>
type MentionUser = Pick<User, 'name' | 'username' | 'email'>

export interface ExtendedTweet extends Tweet {
  hashtags: HashTag[]
  mentions: MentionUser[]
  medias: TweetMedia[]
  bookmarks: number
  likes: number
  retweetCount: number
  commentCount: number
  quoteCount: number
}

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags?: string[] // name of the hashtag formart ["hashtag1", "hashtag2"]
  mentions?: string[] // user_id of the mentioned user format ["user_id1", "user_id2"]
  medias?: TweetMedia[]
}

export interface TweetParams extends ParamsDictionary {
  tweet_id: string
}

export interface TweetQuery extends ParamsDictionary {
  limit: string
  page: string
  tweet_type: string
}
