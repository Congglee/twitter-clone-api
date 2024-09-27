import { Server } from 'http'
import app from '~/app'

let server: Server

server = app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

process.on('SIGTERM', () => {
  // logger.info('SIGTERM received')
  if (server) {
    server.close()
  }
})
