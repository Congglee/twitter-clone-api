import { config } from 'dotenv'
import { validateEnv } from '~/utils/env'

const env = process.env.NODE_ENV
const envFilename = '.env'

export const isProduction = env === 'production'

config({ path: envFilename })

// Validate environment variables
validateEnv()

export const envConfig = {
  port: (process.env.PORT as string) || 8000,
  host: (process.env.HOST as string) || 'http://localhost',
  dbUrl: process.env.DATABASE_URL as string,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  passwordSecret: process.env.PASSWORD_SECRET as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  emailVerifyTokenExpiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI as string,
  clientRedirectCallback: process.env.CLIENT_REDIRECT_CALLBACK as string,
  clientUrl: process.env.CLIENT_URL as string,
  awsRegion: process.env.AWS_REGION as string,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  awsSesFromAddress: process.env.AWS_SES_FROM_ADDRESS as string,
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME as string
}
