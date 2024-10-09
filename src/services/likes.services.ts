import prisma from '~/client'

class LikeService {
  async likeTweet(user_id: string, tweet_id: string) {
    const result = await prisma.like.upsert({
      where: { userId_tweetId: { userId: user_id, tweetId: tweet_id } },
      update: {},
      create: { userId: user_id, tweetId: tweet_id }
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
