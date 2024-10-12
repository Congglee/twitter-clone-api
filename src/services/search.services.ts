import { MediaType, TweetAudience, TweetType } from '@prisma/client'
import prisma from '~/client'
import { MediaTypeQuery, PeopleFollow } from '~/types/search.types'
import { excludeFromObject } from '~/utils/helpers'

class SearchService {
  async search({
    limit,
    page,
    content,
    user_id,
    media_type,
    people_follow
  }: {
    limit: number
    page: number
    content: string
    user_id: string
    media_type?: MediaTypeQuery
    people_follow?: PeopleFollow
  }) {
    const where: any = {
      content: { search: content },
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

    if (media_type === MediaTypeQuery.Image) {
      where['Media'] = { some: { type: MediaType.Image } }
    } else if (media_type === MediaTypeQuery.Video) {
      where['Media'] = { some: { type: MediaType.Video } }
    }

    if (people_follow && people_follow === PeopleFollow.Following) {
      const followed_user_ids = await prisma.follower.findMany({
        where: { followerId: user_id },
        select: { followedUserId: true }
      })
      const ids = followed_user_ids.map((item) => item.followedUserId)
      ids.push(user_id)
      where['userId'] = { in: ids }
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

      const user = excludeFromObject(tweet.user, ['password', 'emailVerifyToken', 'forgotPasswordToken', 'dateOfBirth'])

      return {
        ...excludeFromObject(tweet, ['TweetHashTag', 'Mention', 'Bookmark', 'Like', 'Media', 'user']),
        user,
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
    const [total] = await Promise.all([
      prisma.tweet.count({ where }),
      prisma.tweet.updateMany({
        where: { id: { in: tweetIds } },
        data: { ...inc }
      })
    ])

    return { tweets: result, total: total || 0 }
  }
}

const searchService = new SearchService()
export default searchService
