import { hashPassword } from '../../src/utils/crypto'
import { faker } from '@faker-js/faker'
import { Prisma, UserVerifyStatus } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../../src/client'

const password = 'Test@1234'

const firstUserId = uuidv4()

export const firstUser = {
  name: faker.internet.displayName(),
  email: faker.internet.email(),
  username: `user${firstUserId}`,
  dateOfBirth: new Date(faker.date.past().toISOString()),
  password,
  verify: UserVerifyStatus.Unverified
}

const secondUserId = uuidv4()

export const secondUser = {
  name: faker.internet.displayName(),
  email: faker.internet.email(),
  username: `user${secondUserId}`,
  dateOfBirth: new Date(faker.date.past().toISOString()),
  password,
  verify: UserVerifyStatus.Unverified
}

export const insertMultipleUsers = async (users: Prisma.UserCreateManyInput[]) => {
  await prisma.user.createMany({
    data: users.map((user) => ({
      ...user,
      password: hashPassword(user.password)
    }))
  })
}
