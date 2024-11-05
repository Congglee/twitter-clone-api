import { describe, test, expect } from '@jest/globals'
import { Server } from 'http'
import request from 'supertest'
import app from '~/app'
import prisma from '~/client'
import { server } from './setup'

describe('Server Tests', () => {
  test('should have a running server', () => {
    expect(server).toBeInstanceOf(Server)
    expect(server.listening).toBe(true)
  })

  test('should connect to database', async () => {
    await expect(prisma.user.count()).resolves.not.toThrow()
  })

  test('should respond to health check', async () => {
    // Option 1: Add trailing slash
    const response = await request(app).get('/api-docs/')
    expect(response.status).toBe(200)

    // Option 2: Allow both 200 and 301 status codes
    // const response = await request(app).get('/api-docs')
    // expect([200, 301]).toContain(response.status)
  })

  test('should start with empty database', async () => {
    const users = await prisma.user.findMany()
    expect(users).toHaveLength(0)
  })
})
