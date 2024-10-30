import { User } from '@prisma/client'
import prisma from '~/client'
import HTTP_STATUS from '~/config/httpStatus'
import { AUTH_MESSAGES, USERS_MESSAGES } from '~/config/messages'
import { ErrorWithStatus } from '~/types/errors.types'
import { UpdateMeReqBody } from '~/types/users.types'
import { hashPassword } from '~/utils/crypto'
import { excludeFromList, excludeFromObject } from '~/utils/helpers'

class UsersService {
  async getMe(user_id: string) {
    const user = (await prisma.user.findUnique({ where: { id: user_id } })) as User
    return excludeFromObject(user, ['password', 'emailVerifyToken', 'forgotPasswordToken'])
  }
  async getProfile(username: string) {
    const user = await prisma.user.findFirst({ where: { username } })
    if (user === null) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return excludeFromObject(user, [
      'password',
      'emailVerifyToken',
      'forgotPasswordToken',
      'verify',
      'createdAt',
      'updatedAt'
    ])
  }
  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload

    const user = await prisma.user.update({
      where: { id: user_id },
      data: { ..._payload }
    })

    return excludeFromObject(user, ['password', 'emailVerifyToken', 'forgotPasswordToken'])
  }
  async follow(user_id: string, followed_user_id: string) {
    const follower = await prisma.follower.findFirst({
      where: {
        followerId: user_id,
        followedUserId: followed_user_id
      }
    })
    if (follower === null) {
      await prisma.follower.create({
        data: {
          followerId: user_id,
          followedUserId: followed_user_id
        }
      })

      return { message: USERS_MESSAGES.FOLLOW_SUCCESS }
    }

    return { message: USERS_MESSAGES.FOLLOWED }
  }
  async unfollow(user_id: string, followed_user_id: string) {
    const follower = await prisma.follower.findFirst({
      where: {
        followerId: user_id,
        followedUserId: followed_user_id
      }
    })
    if (follower === null) {
      return { message: USERS_MESSAGES.ALREADY_UNFOLLOWED }
    }

    await prisma.follower.delete({
      where: {
        followerId_followedUserId: {
          followerId: user_id,
          followedUserId: followed_user_id
        }
      }
    })

    return { message: USERS_MESSAGES.UNFOLLOW_SUCCESS }
  }
  async changePassword(user_id: string, new_password: string) {
    await prisma.user.update({
      where: { id: user_id },
      data: { password: hashPassword(new_password) }
    })
    return { message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS }
  }
  async getRandomUsers({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    // Check if user follows anyone
    const followedUserCount = await prisma.follower.count({ where: { followerId: user_id } })

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 30)

    const where: any = {
      NOT: { id: user_id },
      OR: [{ Tweet: { some: { createdAt: { gte: twoWeeksAgo } } } }, {}]
    }

    if (followedUserCount > 0) {
      // Get the IDs of users followed by the current user
      const followed_user_ids = await prisma.follower
        .findMany({
          where: { followerId: user_id },
          select: { followedUserId: true }
        })
        .then((followers) => followers.map((follower) => follower.followedUserId))

      // Add criteria to get users who also follow the same users
      where['OR'].push({
        followedBy: {
          some: { followerId: { in: followed_user_ids } }
        }
      })
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { followedBy: { _count: 'desc' } },
      skip: limit * (page - 1),
      take: limit
    })
    const total = await prisma.user.count({ where })

    const result = excludeFromList(users, ['password', 'emailVerifyToken', 'forgotPasswordToken', 'verify'])

    return { users: result, total }
  }
}

const usersService = new UsersService()
export default usersService
