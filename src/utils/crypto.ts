import { createHash } from 'crypto'
import { envConfig } from '~/config/config'

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string): string {
  return sha256(password + envConfig.passwordSecret)
}
