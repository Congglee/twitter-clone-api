import { check, validationResult } from 'express-validator'

const requiredEnvVars = [
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET_ACCESS_TOKEN',
  'JWT_SECRET_REFRESH_TOKEN',
  'JWT_SECRET_EMAIL_VERIFY_TOKEN',
  'JWT_SECRET_FORGOT_PASSWORD_TOKEN',
  'PASSWORD_SECRET',
  'ACCESS_TOKEN_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
  'EMAIL_VERIFY_TOKEN_EXPIRES_IN',
  'FORGOT_PASSWORD_TOKEN_EXPIRES_IN',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'CLIENT_REDIRECT_CALLBACK',
  'CLIENT_URL',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SES_FROM_ADDRESS',
  'AWS_S3_BUCKET_NAME'
]

export const validateEnv = () => {
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.error(`Environment variable ${envVar} is missing.`)
      process.exit(1)
    }
  })

  const validations = [
    check('PORT').isInt({ min: 1, max: 65535 }).withMessage('PORT must be a valid port number'),
    check('DATABASE_URL').isURL().withMessage('DATABASE_URL must be a valid URL'),
    check('JWT_SECRET_ACCESS_TOKEN').notEmpty().withMessage('JWT_SECRET_ACCESS_TOKEN is required'),
    check('JWT_SECRET_REFRESH_TOKEN').notEmpty().withMessage('JWT_SECRET_REFRESH_TOKEN is required'),
    check('JWT_SECRET_EMAIL_VERIFY_TOKEN').notEmpty().withMessage('JWT_SECRET_EMAIL_VERIFY_TOKEN is required'),
    check('JWT_SECRET_FORGOT_PASSWORD_TOKEN').notEmpty().withMessage('JWT_SECRET_FORGOT_PASSWORD_TOKEN is required'),
    check('PASSWORD_SECRET').notEmpty().withMessage('PASSWORD_SECRET is required'),
    check('ACCESS_TOKEN_EXPIRES_IN').notEmpty().withMessage('ACCESS_TOKEN_EXPIRES_IN is required'),
    check('REFRESH_TOKEN_EXPIRES_IN').notEmpty().withMessage('REFRESH_TOKEN_EXPIRES_IN is required'),
    check('EMAIL_VERIFY_TOKEN_EXPIRES_IN').notEmpty().withMessage('EMAIL_VERIFY_TOKEN_EXPIRES_IN is required'),
    check('FORGOT_PASSWORD_TOKEN_EXPIRES_IN').notEmpty().withMessage('FORGOT_PASSWORD_TOKEN_EXPIRES_IN is required'),
    check('GOOGLE_CLIENT_ID').notEmpty().withMessage('GOOGLE_CLIENT_ID is required'),
    check('GOOGLE_CLIENT_SECRET').notEmpty().withMessage('GOOGLE_CLIENT_SECRET is required'),
    check('GOOGLE_REDIRECT_URI').isURL().withMessage('GOOGLE_REDIRECT_URI must be a valid URL'),
    check('CLIENT_REDIRECT_CALLBACK').isURL().withMessage('CLIENT_REDIRECT_CALLBACK must be a valid URL'),
    check('CLIENT_URL').isURL().withMessage('CLIENT_URL must be a valid URL'),
    check('AWS_REGION').notEmpty().withMessage('AWS_REGION is required'),
    check('AWS_ACCESS_KEY_ID').notEmpty().withMessage('AWS_ACCESS_KEY_ID is required'),
    check('AWS_SECRET_ACCESS_KEY').notEmpty().withMessage('AWS_SECRET_ACCESS_KEY is required'),
    check('AWS_SES_FROM_ADDRESS').notEmpty().withMessage('AWS_SES_FROM_ADDRESS is required'),
    check('AWS_S3_BUCKET_NAME').notEmpty().withMessage('AWS_S3_BUCKET_NAME is required')
  ]

  validations.forEach((validation) => validation.run({} as any))

  const errors = validationResult({} as any)
  if (!errors.isEmpty()) {
    console.error('Environment variable validation failed:', errors.array())
    process.exit(1)
  }
}
