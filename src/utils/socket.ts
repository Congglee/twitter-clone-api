import { UserVerifyStatus } from '@prisma/client'
import { config } from 'dotenv'
import { Server as ServerHttp } from 'http'
import { Server } from 'socket.io'
import prisma from '~/client'
import HTTP_STATUS from '~/config/httpStatus'
import logger from '~/config/logger'
import { USERS_MESSAGES } from '~/config/messages'
import { ErrorWithStatus } from '~/types/errors.types'
import { TokenPayload } from '~/types/users.types'
import { verifyAccessToken } from '~/utils/commons'

config()

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL }
  })

  const users: { [key: string]: { socket_id: string } } = {}

  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]

    try {
      const decoded_authorization = await verifyAccessToken(access_token)

      const { verify } = decoded_authorization as TokenPayload
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }

      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({ message: 'Unauthorized', name: 'UnauthorizedError', data: error })
    }
  })

  io.on('connection', (socket) => {
    logger.info(`User ${socket.id} connected`)

    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
    users[user_id] = { socket_id: socket.id }

    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })

    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') {
        socket.disconnect()
      }
    })

    socket.on('send_message', async (data) => {
      const { receiver_id, sender_id, content } = data.payload
      const receiver_socket_id = users[receiver_id]?.socket_id

      const result = await prisma.conversation.create({
        data: {
          senderId: sender_id,
          receiverId: receiver_id,
          content
        }
      })

      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receive_message', {
          payload: result
        })
      }
    })

    socket.on('disconnect', () => {
      delete users[user_id]
      logger.info(`User ${socket.id} disconnected`)
    })
  })
}

export default initSocket
