import { Media, Prisma } from '@prisma/client'
import prisma from '~/client'
import { TweetRequestBody } from '~/types/tweets.types'

class TweetsService {
  private async createTweetMedia(ctx: Prisma.TransactionClient, tweet_id: string, media: Media) {
    return await ctx.media.create({
      data: {
        url: media.url,
        type: media.type,
        tweetId: tweet_id
      }
    })
  }
  private async checkAndCreateTweetHashtag(ctx: Prisma.TransactionClient, tweet_id: string, hashtag: string) {
    // Find or create hashtag
    const hashtagRecord = await ctx.hashTag.upsert({
      where: { name: hashtag },
      update: {},
      create: { name: hashtag }
    })

    // Link the hashtag to the tweet
    return await ctx.tweetHashTag.create({
      data: {
        tweetId: tweet_id,
        hashtagId: hashtagRecord.id
      }
    })
  }
  private async createTweetMention(ctx: Prisma.TransactionClient, tweet_id: string, mention: string) {
    // Create mention related to the tweet
    return await ctx.mention.create({
      data: {
        tweetId: tweet_id,
        mentionedUserId: mention
      }
    })
  }
  async createTweet(user_id: string, body: TweetRequestBody) {
    const { type, audience, content, parent_id, hashtags, mentions, medias } = body

    // Start a internal transaction to create a tweet
    const newTweet = await prisma.$transaction(async (ctx) => {
      // 1. Create the tweet
      const tweet = await prisma.tweet.create({
        data: {
          type,
          audience,
          content,
          parentId: parent_id, // This can be null or a valid tweet id
          userId: user_id
        }
      })
      const tweet_id = tweet.id

      // 2. Create media if provided
      if (medias && medias.length) {
        await Promise.all(medias.map((media) => this.createTweetMedia(ctx, tweet_id, media)))
      }

      // 3. Create hashtags if provided
      if (hashtags && hashtags.length) {
        await Promise.all(hashtags.map((hashtag) => this.checkAndCreateTweetHashtag(ctx, tweet_id, hashtag)))
      }

      // 4. Create mentions if provided
      if (mentions && mentions.length) {
        await Promise.all(mentions.map((mention) => this.createTweetMention(ctx, tweet_id, mention)))
      }

      return tweet
    })

    return newTweet
  }
  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { userViews: { increment: 1 } } : { guestViews: { increment: 1 } }
    const result = await prisma.tweet.update({
      where: { id: tweet_id },
      data: { ...inc },
      select: { guestViews: true, userViews: true }
    })
    return result
  }
}

const tweetsService = new TweetsService()
export default tweetsService
