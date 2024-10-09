import prisma from '~/client'

class BookmarkService {
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const result = await prisma.bookmark.upsert({
      where: { userId_tweetId: { userId: user_id, tweetId: tweet_id } },
      update: {},
      create: { userId: user_id, tweetId: tweet_id }
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
