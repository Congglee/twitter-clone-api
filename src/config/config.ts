import { config } from 'dotenv'
import path from 'path'

const env = process.env.NODE_ENV

config({ path: path.join(process.cwd(), '.env') })

export const isProduction = env === 'production'

export const envConfig = {
  port: (process.env.PORT as string) || 3000,
  dbUrl: process.env.DATABASE_URL as string
}
