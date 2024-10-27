import { MediaType, TweetAudience } from '@prisma/client'
import prisma from '~/client'
import tweetsService from '~/services/tweets.services'
import { MediaTypeQuery, PeopleFollow } from '~/types/search.types'

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
    // Split the content string into individual words and join them with the `&` operator to match PostgreSQL full-text search requirements
    const search = content.split(' ').join(' & ')
    const where: any = {
      content: { search },
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

    const { result, total } = await tweetsService.processTweetsData({ tweets, where, user_id })

    return { tweets: result, total: total || 0 }
  }
}

const searchService = new SearchService()
export default searchService
