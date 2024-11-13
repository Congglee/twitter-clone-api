import { mockClient } from 'aws-sdk-client-mock'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { envConfig } from '~/config/config'
import { sendForgotPasswordEmail, sendVerifyRegisterEmail } from '~/utils/mail'
import { describe, expect, test } from '@jest/globals'

/**
 * Mock the `SESClient` constructor and `SendEmailCommand` operation
 * By using `mockClient` from `aws-sdk-client-mock` we can mock the `SESClient` constructor and `SendEmailCommand` operation
 * This way, we can test the `sendVerifyRegisterEmail` function without actually sending an email
 */
const sesMock = mockClient(SESClient)

describe('Mail Unit Tests', () => {
  beforeEach(() => {
    // Reset the mock before each test
    sesMock.reset()

    // Mock the `SendEmailCommand` operation to resolve with an empty object
    // Put an empty object in the `resolves` method to mock the `SendEmailCommand` operation to resolve with an empty object
    sesMock.on(SendEmailCommand).resolves({})
  })

  describe('sendVerifyRegisterEmail', () => {
    test('should send verification email with correct parameters', async () => {
      const toAddress = 'test@example.com'
      const emailVerifyToken = 'email_verify_test_token'

      await sendVerifyRegisterEmail(toAddress, emailVerifyToken)

      // Verify that the `SendEmailCommand` operation was called once
      // Use the `calls` method to get the number of times the `SendEmailCommand` operation was called
      expect(sesMock.calls()).toHaveLength(1)

      /**
       * Verify that the `SendEmailCommand` operation was called with the correct parameters
       * Use the `commandCalls` method to get the calls to a specific operation (in this case, `SendEmailCommand`)
       */
      const [sendEmailCommand] = sesMock.commandCalls(SendEmailCommand)

      // Get the input parameters passed to the `SendEmailCommand` operation call
      //  - `args[0]` contains the first call to the operation with the input parameters passed to the operation call
      //  - `input` contains the input parameters passed to the operation call
      const params = sendEmailCommand.args[0].input

      // Verify that the `SendEmailCommand` operation was called with the correct parameters
      expect(params).toEqual({
        Destination: {
          CcAddresses: [],
          ToAddresses: [toAddress]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: expect.stringContaining('Confirm your email address')
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Verify your email'
          }
        },
        Source: envConfig.awsSesFromAddress,
        ReplyToAddresses: []
      })

      const htmlContent = params.Message?.Body?.Html?.Data || ''
      expect(htmlContent).toContain('Confirm your email address')
      expect(htmlContent).toContain('Verify Your Account')
      expect(htmlContent).toContain(`${envConfig.clientUrl}/verify-email?token=${emailVerifyToken}`)
    })
  })

  describe('sendForgotPasswordEmail', () => {
    test('should send forgot email with correct parameters', async () => {
      const toAddress = 'test@example.com'
      const forgotPasswordToken = 'test_token'
      const username = 'testuser'

      await sendForgotPasswordEmail(toAddress, forgotPasswordToken, username)

      // Verify that the `SendEmailCommand` operation was called once
      // Use the `calls` method to get the number of times the `SendEmailCommand` operation was called
      expect(sesMock.calls()).toHaveLength(1)

      /**
       * Verify that the `SendEmailCommand` operation was called with the correct parameters
       * Use the `commandCalls` method to get the calls to a specific operation (in this case, `SendEmailCommand`)
       */
      const [sendEmailCommand] = sesMock.commandCalls(SendEmailCommand)

      // Get the input parameters passed to the `SendEmailCommand` operation call
      //  - `args[0]` contains the first call to the operation with the input parameters passed to the operation call
      //  - `input` contains the input parameters passed to the operation call
      const params = sendEmailCommand.args[0].input

      // Verify that the `SendEmailCommand` operation was called with the correct parameters
      expect(params).toEqual({
        Destination: {
          CcAddresses: [],
          ToAddresses: [toAddress]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: expect.stringContaining('Reset your password?')
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Password reset request'
          }
        },
        Source: envConfig.awsSesFromAddress,
        ReplyToAddresses: []
      })

      // Verify the email content contains key elements
      const htmlContent = params.Message?.Body?.Html?.Data || ''
      expect(htmlContent).toContain('Reset your password?')
      expect(htmlContent).toContain('Reset Password')
      expect(htmlContent).toContain(`${envConfig.clientUrl}/forgot-password?token=${forgotPasswordToken}`)
    })
  })
})
