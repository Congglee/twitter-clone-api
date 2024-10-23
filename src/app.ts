import cors from 'cors'
import express from 'express'
import { createServer } from 'http'
import { UPLOAD_VIDEO_DIR } from '~/config/dir'
import { removeExpiredRefreshTokens } from '~/jobs/auth.jobs'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import authRouter from '~/routes/auth.routes'
import bookmarksRouter from '~/routes/bookmarks.routes'
import conversationsRouter from '~/routes/conversations.routes'
import likesRouter from '~/routes/likes.routes'
import mediasRouter from '~/routes/medias.routes'
import searchRouter from '~/routes/search.routes'
import staticRouter from '~/routes/static.routes'
import tweetsRouter from '~/routes/tweets.routes'
import usersRouter from '~/routes/users.routes'
import docsRouter from '~/routes/docs.routes'
import { initFolder } from '~/utils/file'
import initSocket from '~/utils/socket'

// Uncomment this line to seed the database with some initial data
// import '~/utils/seed'

const app = express()
const httpServer = createServer(app)

removeExpiredRefreshTokens.start()

app.use(cors())

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
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// app.use('/static', express.static(UPLOAD_IMAGE_DIR))

app.use(defaultErrorHandler)

initSocket(httpServer)

export default httpServer
