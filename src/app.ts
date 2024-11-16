import cors, { CorsOptions } from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { createServer } from 'http'
import { envConfig, isProduction } from '~/config/config'
import { UPLOAD_VIDEO_DIR } from '~/config/dir'
import { removeExpiredRefreshTokens } from '~/jobs/auth.jobs'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import authRouter from '~/routes/auth.routes'
import bookmarksRouter from '~/routes/bookmarks.routes'
import conversationsRouter from '~/routes/conversations.routes'
import docsRouter from '~/routes/docs.routes'
import likesRouter from '~/routes/likes.routes'
import mediasRouter from '~/routes/medias.routes'
import notificationsRouter from '~/routes/notifications.routes'
import searchRouter from '~/routes/search.routes'
import staticRouter from '~/routes/static.routes'
import tweetsRouter from '~/routes/tweets.routes'
import usersRouter from '~/routes/users.routes'
import { initFolder } from '~/utils/file'
import initSocket from '~/utils/socket'

// Uncomment this line to seed the database with some initial data
// import '~/utils/seed'

const app = express()
const httpServer = createServer(app)

// Only start cron job in production/development, not in test
if (process.env.NODE_ENV !== 'test') {
  removeExpiredRefreshTokens.start()
}

app.use(helmet())

const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*'
}
app.use(cors(corsOptions))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit headers in the `RateLimit-*` headers
  legacyHeaders: true // Disable default `X-RateLimit-*` headers
})
app.use(limiter)

initFolder()

app.use(express.json())

app.use('/api-docs', docsRouter)
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)
app.use('/conversations', conversationsRouter)
app.use('/notifications', notificationsRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// app.use('/static', express.static(UPLOAD_IMAGE_DIR))

app.use(defaultErrorHandler)

initSocket(httpServer)

export default httpServer
