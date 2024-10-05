import express from 'express'
import { UPLOAD_VIDEO_DIR } from '~/config/dir'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import authRouter from '~/routes/auth.routes'
import mediasRouter from '~/routes/medias.routes'
import staticRouter from '~/routes/static.routes'
import usersRouter from '~/routes/users.routes'
import { initFolder } from '~/utils/file'
import cors from 'cors'
import { removeExpiredRefreshTokens } from '~/jobs/auth.jobs'
import tweetsRouter from '~/routes/tweets.routes'

const app = express()

removeExpiredRefreshTokens.start()

app.use(cors())

initFolder()

app.use(express.json())

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// app.use('/static', express.static(UPLOAD_IMAGE_DIR))

app.use(defaultErrorHandler)

export default app
