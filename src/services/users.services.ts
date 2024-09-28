import { User } from '@prisma/client'
import prisma from '~/client'
import HTTP_STATUS from '~/config/httpStatus'
import { AUTH_MESSAGES } from '~/config/messages'
import { ErrorWithStatus } from '~/types/errors'
import { UpdateMeReqBody } from '~/types/requests'
import { excludeFromObject } from '~/utils/helpers'

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
}

const usersService = new UsersService()
export default usersService
