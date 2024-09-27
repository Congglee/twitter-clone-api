import prisma from '~/client'

class UsersService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload
    const result = await prisma.user.create({
      data: { email, password }
    })
    return result
  }
}

const usersService = new UsersService()
export default usersService
