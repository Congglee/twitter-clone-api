import { faker } from '@faker-js/faker'

export const newUserFixture = {
  name: faker.person.fullName(),
  email: 'johndoe@imail.edu.vn',
  password: 'Test@1234',
  confirm_password: 'Test@1234',
  date_of_birth: faker.date.past().toISOString()
}
