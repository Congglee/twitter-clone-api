import { MediaType, Tweet, TweetAudience, TweetType, UserVerifyStatus } from '@prisma/client'
import { checkSchema } from 'express-validator'
import { AUTH_MESSAGES, TWEETS_MESSAGES } from '~/config/messages'
import { enumToPrismaArray } from '~/utils/commons'
import { validate } from '~/utils/validation'
import { validate as uuidValidate } from 'uuid'
import { isEmpty } from 'lodash'
import prisma from '~/client'
import { ErrorWithStatus } from '~/types/errors.types'
import HTTP_STATUS from '~/config/httpStatus'
import { NextFunction, Request, Response } from 'express'
import { wrapRequestHandler } from '~/utils/handlers'
import { excludeFromObject } from '~/utils/helpers'

const tweetTypes = enumToPrismaArray(TweetType)
const tweetAudiences = enumToPrismaArray(TweetAudience)
const mediaTypes = enumToPrismaArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      audience: {
        isIn: {
          options: [tweetAudiences],
          errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
        }
      },
      parent_id: {
        custom: {
          options: async (value, { req }) => {
            const type = req.body.type

            // If `type` is retweet, comment, quotetweet then `parent_id` must be `tweet_id` of parent tweet
            if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type)) {
              if (!uuidValidate(value)) {
                throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
              }

              const parentTweet = await prisma.tweet.findUnique({
                where: { id: value }
              })
              if (!parentTweet) {
                throw new ErrorWithStatus({
                  message: TWEETS_MESSAGES.PARENT_TWEET_NOT_FOUND,
                  status: HTTP_STATUS.NOT_FOUND
                })
              }
            }

            // If type is tweet then parent_id must be null
            if (type === TweetType.Tweet && value !== null) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }

            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]

            // If `type` is comment, quotetweet, tweet and no `mentions` and `hashtags` then `content` must be a string and not empty
            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value === ''
            ) {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }

            // If `type` is retweet then `content` must be `''`
            if (type === TweetType.Retweet && value !== '') {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
            }

            return true
          }
        }
      },
      hashtags: {
        optional: { options: { nullable: true } },
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Requires each element in the `hashtags` array to be a string
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
            }
            return true
          }
        }
      },
      mentions: {
        optional: { options: { nullable: true } },
        isArray: true,
        custom: {
          options: async (value, { req }) => {
            // Requires each element in the `mentions` array to be a user_id
            if (value.some((item: any) => !uuidValidate(item))) {
              throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
            }

            // Check for duplicate user_ids in the mentions array
            const uniqueMentions = new Set(value)
            if (uniqueMentions.size !== value.length) {
              throw new Error(TWEETS_MESSAGES.DUPLICATE_MENTIONS_NOT_ALLOWED)
            }

            // Check if all mentioned users exist
            if (value && value.length) {
              await Promise.all(
                value.map(async (item: string) => {
                  const user = await prisma.user.findUnique({ where: { id: item } })
                  if (!user) {
                    throw new ErrorWithStatus({
                      message: TWEETS_MESSAGES.METIONS_NOT_FOUND,
                      status: HTTP_STATUS.NOT_FOUND
                    })
                  }
                })
              )
            }

            return true
          }
        }
      },
      medias: {
        optional: { options: { nullable: true } },
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Requires each element in the `medias` array to be a media object
            if (
              value.some((item: any) => {
                return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
              })
            ) {
              throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!uuidValidate(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEETS_MESSAGES.INVALID_TWEET_ID
              })
            }

            const [tweet, childTweets] = await Promise.all([
              prisma.tweet.findUnique({
                where: { id: value },
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
                }
              }),
              prisma.tweet.findMany({
                where: {
                  parentId: value,
                  OR: [{ type: TweetType.Retweet }, { type: TweetType.Comment }, { type: TweetType.QuoteTweet }]
                }
              })
            ])

            if (!tweet) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND
              })
            }

            // Transform data
            const mentions = tweet.Mention.map((mention) => mention.mentionedUser)
            const hashtags = tweet.TweetHashTag.map((tweetHashTag) => tweetHashTag.hashtag)
            const medias = tweet.Media.map((media) => ({ url: media.url, type: media.type }))

            // Calculate counts
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

            ;(req as Request).tweet = {
              ...excludeFromObject(tweet, ['TweetHashTag', 'Mention', 'Bookmark', 'Like', 'Media']),
              hashtags,
              mentions,
              medias,
              bookmarks: bookmarkCount,
              likes: likeCount,
              retweetCount,
              commentCount,
              quoteCount
            }

            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet

  if (tweet.audience === TweetAudience.TwitterCircle) {
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: AUTH_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
      })
    }

    const author = await prisma.user.findUnique({
      where: { id: tweet.userId },
      include: { twitterCircle: true }
    })

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: AUTH_MESSAGES.USER_NOT_FOUND
      })
    }

    const { user_id } = req.decoded_authorization
    const isInTwitterCircle = author.twitterCircle.some((user_circle_id) => user_circle_id.id === user_id)

    if (author.id !== user_id && !isInTwitterCircle) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      })
    }
  }

  next()
})

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error('1 <= limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('page >= 100')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
