import { TweetType } from '@prisma/client'
import prisma from '~/client'
import { TweetRequestBody } from '~/types/tweets.types'
import { excludeFromObject } from '~/utils/helpers'

class TweetsService {
  private async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagRecords = await Promise.all(
      hashtags.map(async (hashtag) => {
        // Cannot use upsert here because it may cause unique constraint violation
        const existingHashtag = await prisma.hashTag.findUnique({
          where: { name: hashtag }
        })
        if (existingHashtag) {
          return existingHashtag
        }

        const hashtagRecord = await prisma.hashTag.create({
          data: { name: hashtag }
        })

        return hashtagRecord
      })
    )
    return hashtagRecords.map((hashtagRecord) => hashtagRecord.id)
  }
  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags as string[])

    // Start a internal transaction to create a tweet
    const newTweet = await prisma.$transaction(async (ctx) => {
      // 1. Create the tweet
      const tweet = await prisma.tweet.create({
        data: {
          type: body.type,
          audience: body.audience,
          content: body.content,
          parentId: body.parent_id, // This can be null or a valid tweet id
          userId: user_id
        }
      })

      // 2. Create media if provided
      if (body.medias && body.medias.length) {
        await Promise.all(
          body.medias.map((media) =>
            ctx.media.create({
              data: { ...media, tweetId: tweet.id }
            })
          )
        )
      }

      // 3. Create hashtags if provided
      if (hashtags && hashtags.length) {
        await Promise.all(
          hashtags.map((hashtag) =>
            ctx.tweetHashTag.create({
              data: {
                tweetId: tweet.id,
                hashtagId: hashtag
              }
            })
          )
        )
      }

      // 4. Create mentions if provided
      if (body.mentions && body.mentions.length) {
        await Promise.all(
          body.mentions.map((mention) =>
            ctx.mention.create({
              data: {
                tweetId: tweet.id,
                mentionedUserId: mention
              }
            })
          )
        )
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
  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string
  }) {
    const tweets = await prisma.tweet.findMany({
      where: { parentId: tweet_id, type: tweet_type },
      include: {
        TweetHashTag: { include: { hashtag: true } },
        Mention: {
          include: {
            mentionedUser: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true
              }
            }
          }
        },
        Bookmark: true,
        Like: true,
        Media: true
      },
      skip: limit * (page - 1),
      take: limit
    })

    const tweetIds = tweets.map((tweet) => tweet.id)

    const childTweets = await prisma.tweet.findMany({
      where: {
        parentId: { in: tweetIds },
        type: { in: [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet] }
      }
    })

    const result = tweets.map((tweet) => {
      const mentions = tweet.Mention.map((mention) => mention.mentionedUser)
      const hashtags = tweet.TweetHashTag.map((tweetHashTag) => tweetHashTag.hashtag)
      const medias = tweet.Media.map((media) => ({ url: media.url, type: media.type }))

      let retweetCount = 0
      let commentCount = 0
      let quoteCount = 0

      childTweets.forEach((childTweet) => {
        if (childTweet.type === TweetType.Retweet) {
          retweetCount++
        } else if (childTweet.type === TweetType.Comment) {
          commentCount++
        } else if (childTweet.type === TweetType.QuoteTweet) {
          quoteCount++
        }
      })

      const bookmarkCount = tweet.Bookmark.length
      const likeCount = tweet.Like.length

      return {
        ...excludeFromObject(tweet, ['TweetHashTag', 'Mention', 'Bookmark', 'Like', 'Media']),
        hashtags,
        mentions,
        medias,
        bookmarks: bookmarkCount,
        likes: likeCount,
        retweetCount,
        commentCount,
        quoteCount,
        views: tweet.userViews + tweet.guestViews
      }
    })

    const inc = user_id ? { userViews: { increment: 1 } } : { guestViews: { increment: 1 } }
    const [, total] = await Promise.all([
      prisma.tweet.updateMany({
        where: { id: { in: tweetIds } },
        data: { ...inc }
      }),
      prisma.tweet.count({
        where: { parentId: tweet_id, type: tweet_type }
      })
    ])

    return { tweets: result, total }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
