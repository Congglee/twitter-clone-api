import { MediaType, TweetAudience, TweetType } from '@prisma/client'
import { checkSchema } from 'express-validator'
import { TWEETS_MESSAGES } from '~/config/messages'
import { enumToPrismaArray } from '~/utils/commons'
import { validate } from '~/utils/validation'
import { validate as uuidValidate } from 'uuid'
import { isEmpty } from 'lodash'
import prisma from '~/client'
import { ErrorWithStatus } from '~/types/errors'
import HTTP_STATUS from '~/config/httpStatus'

const tweetTypes = enumToPrismaArray(TweetType)
const tweetAudiences = enumToPrismaArray(TweetAudience)
const mediaTypes = enumToPrismaArray(MediaType)

export const createTweetValidator = validate(
  checkSchema({
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
  })
)
