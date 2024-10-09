import { TweetType, TweetAudience, Media, User, Tweet, HashTag } from '@prisma/client'

type MentionUser = Pick<User, 'name' | 'username' | 'email'>

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags?: string[] // name of the hashtag formart ["hashtag1", "hashtag2"]
  mentions?: string[] // user_id of the mentioned user format ["user_id1", "user_id2"]
  medias?: Media[]
}

export interface ExtendedTweet extends Tweet {
  hashtags: HashTag[]
  mentions: MentionUser[]
  medias: Pick<Media, 'url' | 'type'>[]
  bookmarks: number
  likes: number
  retweetCount: number
  commentCount: number
  quoteCount: number
}
