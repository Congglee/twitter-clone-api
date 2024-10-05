import { TweetType, TweetAudience, Media } from '@prisma/client'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags?: string[] // name of the hashtag formart ["hashtag1", "hashtag2"]
  mentions?: string[] // user_id of the mentioned user format ["user_id1", "user_id2"]
  medias?: Media[]
}
