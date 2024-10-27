import { TweetType } from '@prisma/client'
import prisma from '~/client'

class LikeService {
  async likeTweet({
    user_id,
    tweet_id,
    tweet_type,
    parent_id
  }: {
    user_id: string
    tweet_id: string
    tweet_type: TweetType
    parent_id?: string | null
  }) {
    let originalTweetId = tweet_id
    if (tweet_type === TweetType.Retweet && parent_id) {
      originalTweetId = parent_id
    }

    const result = await prisma.like.upsert({
      where: { userId_tweetId: { userId: user_id, tweetId: originalTweetId } },
      update: {},
      create: { userId: user_id, tweetId: originalTweetId }
    })

    return result
  }
  async unlikeTweet(user_id: string, tweet_id: string) {
    const result = await prisma.like.delete({
      where: { userId_tweetId: { userId: user_id, tweetId: tweet_id } }
    })

    return result
  }
}

const likeService = new LikeService()
export default likeService
