import { faker } from '@faker-js/faker'

export const newUserFixture = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: 'Test@1234',
  confirm_password: 'Test@1234',
  date_of_birth: faker.date.past().toISOString()
}
