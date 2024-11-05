import prisma from '../../src/client'
import { beforeAll, afterAll, beforeEach } from '@jest/globals'
import { stopCronJobs } from './setupCronJobs'

const setupTestDB = () => {
  beforeAll(async () => {
    stopCronJobs()
    await prisma.$connect()
  })

  beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.refreshToken.deleteMany()
    await prisma.follower.deleteMany()
    await prisma.tweet.deleteMany()
    await prisma.hashTag.deleteMany()
    await prisma.tweetHashTag.deleteMany()
    await prisma.mention.deleteMany()
    await prisma.media.deleteMany()
    await prisma.videoStatus.deleteMany()
    await prisma.bookmark.deleteMany()
    await prisma.like.deleteMany()
    await prisma.conversation.deleteMany()
    await prisma.notification.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })
}

export default setupTestDB
