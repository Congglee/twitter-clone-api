import { TweetType } from '@prisma/client'
import prisma from '~/client'

class BookmarkService {
  async bookmarkTweet({
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

    const result = await prisma.bookmark.upsert({
      where: { userId_tweetId: { userId: user_id, tweetId: originalTweetId } },
      update: {},
      create: { userId: user_id, tweetId: originalTweetId }
    })

    return result
  }
  async unbookmarkTweet(user_id: string, tweet_id: string) {
    const result = await prisma.bookmark.delete({
      where: { userId_tweetId: { userId: user_id, tweetId: tweet_id } }
    })

    return result
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService
