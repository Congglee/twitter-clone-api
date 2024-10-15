import { RegisterReqBody } from '~/types/users.types'
import { faker } from '@faker-js/faker'
import { TweetRequestBody } from '~/types/tweets.types'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '@prisma/client'
import logger from '~/config/logger'
import prisma from '~/client'
import { hashPassword } from '~/utils/crypto'
import { v4 as uuidv4 } from 'uuid'

// Password for the seed user
const PASSWORD = 'TwitterClone@123456'

// ID of your account, used to follow others
const MYID = '04e8de3b-2537-4758-86d0-4c6d9ca47153'

const USER_COUNT = 400

const createRandomUser = () => {
  const user: RegisterReqBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString()
  }
  return user
}

const createRandomTweet = () => {
  const tweet: TweetRequestBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160
    }),
    hashtags: ['NodeJS', 'TypeScript', 'ExpressJS', 'ReactJS', 'RestAPI', 'ReactJS', 'Prisma', 'NextJS'],
    medias: [{ url: faker.image.url(), type: MediaType.Image }],
    mentions: [],
    parent_id: null
  }
  return tweet
}

const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
})

const insertMultipleUsers = async (users: RegisterReqBody[]) => {
  logger.info('Inserting users...')
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = uuidv4()
      await prisma.user.create({
        data: {
          id: user_id,
          name: user.name,
          email: user.email,
          username: `user${user_id}`,
          dateOfBirth: new Date(user.date_of_birth),
          password: hashPassword(user.password),
          verify: UserVerifyStatus.Verified
        }
      })
      return user_id
    })
  )
  logger.info(`Inserted ${result.length} users`)
  return result
}

const followMultipleUsers = async (user_id: string, followed_user_id: string[]) => {
  logger.info('Following users...')
  const result = await Promise.all(
    followed_user_id.map(async (followed_user_id) => {
      await prisma.follower.create({
        data: {
          followerId: user_id,
          followedUserId: followed_user_id
        }
      })
    })
  )
  logger.info(`Followed ${result.length} users`)
}

const checkAndCreateHashtags = async (hashtags: string[]) => {
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

const insertTweet = async (user_id: string, body: TweetRequestBody) => {
  const hashtags = await checkAndCreateHashtags(body.hashtags as string[])

  // 1. Create the tweet
  const tweet = await prisma.tweet.create({
    data: {
      type: body.type,
      audience: body.audience,
      content: body.content,
      parentId: body.parent_id,
      userId: user_id
    }
  })

  // 2. Create media
  if (body.medias && body.medias.length) {
    for (const media of body.medias) {
      await prisma.media.create({ data: { ...media, tweetId: tweet.id } })
    }
  }

  // 3. Create hashtags
  if (hashtags && hashtags.length) {
    for (const hashtag of hashtags) {
      const existingTweetHashTag = await prisma.tweetHashTag.findUnique({
        where: {
          tweetId_hashtagId: {
            tweetId: tweet.id,
            hashtagId: hashtag
          }
        }
      })
      if (!existingTweetHashTag) {
        await prisma.tweetHashTag.create({ data: { tweetId: tweet.id, hashtagId: hashtag } })
      }
    }
  }

  // 4. Create mentions
  if (body.mentions && body.mentions.length) {
    for (const mention of body.mentions) {
      await prisma.mention.create({ data: { tweetId: tweet.id, mentionedUserId: mention } })
    }
  }

  return tweet
}

const insertMultipleTweets = async (ids: string[]) => {
  logger.info('Inserting tweets...')
  logger.info('Counting...')
  let count = 0
  for (const id of ids) {
    await insertTweet(id, createRandomTweet())
    await insertTweet(id, createRandomTweet())
    count += 2
    logger.info(`Inserted ${count} tweets`)
  }
}

insertMultipleUsers(users).then((ids) => {
  followMultipleUsers(MYID, ids).catch((error) => {
    logger.error('Error while following users')
    logger.error(error)
  })
  insertMultipleTweets(ids).catch((error) => {
    logger.error('Error while inserting tweets')
    logger.error(error)
  })
})
