import { Prisma, TweetAudience, TweetType } from '@prisma/client'
import prisma from '~/client'
import { TweetRequestBody, TweetWithRelations } from '~/types/tweets.types'
import { excludeFromObject } from '~/utils/helpers'

class TweetsService {
  async indexTweets() {
    const indexName = 'tweets_content_idx'
    const tableName = 'tweets'
    const columnName = 'content'

    // Check if the index exists
    const indexExists = (await prisma.$queryRaw`
      SELECT to_regclass(${indexName}) IS NOT NULL AS exists
    `) as { exists: boolean }[]

    if (!indexExists[0].exists) {
      // Create the full-text search index
      await prisma.$executeRaw`
        CREATE INDEX ${Prisma.sql([indexName])} ON ${Prisma.sql([tableName])} USING GIN (to_tsvector('english', ${Prisma.sql([columnName])}));
      `
    }
  }
  private async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagRecords = await Promise.all(
      hashtags.map(async (hashtag) => {
        const existingHashtag = await prisma.hashTag.findFirst({
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
  async processTweetsData({
    tweets,
    where,
    user_id,
    hasFollowed
  }: {
    tweets: TweetWithRelations[]
    where: Prisma.TweetWhereInput
    user_id?: string
    hasFollowed?: boolean
  }) {
    const tweet_ids = tweets.map((tweet) => tweet.id)

    const childTweets = await prisma.tweet.findMany({
      where: {
        parentId: { in: tweet_ids },
        type: { in: [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet] }
      }
    })

    const result = tweets.map((tweet) => {
      const mentions = tweet.Mention?.map((mention) => mention.mentionedUser)
      const hashtags = tweet.TweetHashTag?.map((tweetHashTag) => tweetHashTag.hashtag)
      const medias = tweet.Media?.map((media) => ({ url: media.url, type: media.type }))

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

      const bookmarkCount = tweet.Bookmark?.length
      const likeCount = tweet.Like?.length

      const user =
        tweet.user &&
        excludeFromObject(tweet.user, ['password', 'emailVerifyToken', 'forgotPasswordToken', 'dateOfBirth'])

      return {
        ...excludeFromObject(tweet, ['TweetHashTag', 'Mention', 'Bookmark', 'Like', 'Media']),
        user,
        hashtags,
        mentions,
        medias,
        bookmarks: bookmarkCount,
        likes: likeCount,
        retweetCount,
        commentCount,
        quoteCount,
        views: tweet.userViews + tweet.guestViews,
        createdAt: tweet.createdAt
      }
    })

    if (hasFollowed) {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else {
      result.sort((a, b) => {
        const interactionsA = a.likes + a.views + a.commentCount
        const interactionsB = b.likes + b.views + b.commentCount

        if (interactionsA !== interactionsB) {
          return interactionsB - interactionsA
        }

        const retweetsA = a.retweetCount
        const retweetsB = b.retweetCount

        if (retweetsA !== retweetsB) {
          return retweetsB - retweetsA
        }

        const bookmarksA = a.bookmarks
        const bookmarksB = b.bookmarks

        if (bookmarksA !== bookmarksB) {
          return bookmarksB - bookmarksA
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    }

    const inc = user_id ? { userViews: { increment: 1 } } : { guestViews: { increment: 1 } }
    const [total] = await Promise.all([
      prisma.tweet.count({ where }),
      prisma.tweet.updateMany({
        where: { id: { in: tweet_ids } },
        data: { ...inc }
      })
    ])

    return { result, total }
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
    const where = { parentId: tweet_id, type: tweet_type }

    const tweets = await prisma.tweet.findMany({
      where,
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

    const { result, total } = await this.processTweetsData({ tweets, where, user_id })

    return { tweets: result, total }
  }
  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const followed_user_ids = await prisma.follower.findMany({
      where: { followerId: user_id },
      select: { followedUserId: true }
    })
    const hasFollowed = followed_user_ids.length > 0

    const ids = followed_user_ids.map((item) => item.followedUserId)
    ids.push(user_id)

    const where: any = {
      ...(followed_user_ids.length && { userId: { in: ids } }),
      OR: [
        { audience: TweetAudience.Everyone },
        {
          AND: [
            { audience: TweetAudience.TwitterCircle },
            {
              user: {
                twitterCircle: {
                  some: { id: user_id }
                }
              }
            }
          ]
        }
      ]
    }

    const tweets = await prisma.tweet.findMany({
      where,
      include: {
        user: true,
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

    const { result, total } = await this.processTweetsData({ tweets, where, user_id, hasFollowed })

    return { tweets: result, total: total || 0 }
  }
  async getBookmarkTweets({
    user_id,
    limit,
    page,
    keyword
  }: {
    user_id: string
    limit: number
    page: number
    keyword?: string
  }) {
    const search = keyword ? keyword.split(' ').join('&') : ''
    const where = {
      Bookmark: { some: { userId: user_id } },
      AND: keyword
        ? [
            {
              OR: [
                { content: { search } },
                {
                  user: { OR: [{ name: { search } }, { username: { search } }] }
                }
              ]
            }
          ]
        : []
    }

    const tweets = await prisma.tweet.findMany({
      where,
      include: {
        user: true,
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

    const { result, total } = await this.processTweetsData({ tweets, where, user_id })

    return { tweets: result, total: total || 0 }
  }
  async getLikeTweets({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const where = { Like: { some: { userId: user_id } } }

    const tweets = await prisma.tweet.findMany({
      where,
      include: {
        user: true,
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

    const { result, total } = await this.processTweetsData({ tweets, where, user_id })

    return { tweets: result, total: total || 0 }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
