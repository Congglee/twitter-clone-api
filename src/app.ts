import express from 'express'
import { UPLOAD_VIDEO_DIR } from '~/config/dir'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import authRouter from '~/routes/auth.routes'
import mediasRouter from '~/routes/medias.routes'
import staticRouter from '~/routes/static.routes'
import usersRouter from '~/routes/users.routes'
import { initFolder } from '~/utils/file'
import cors from 'cors'
import '~/jobs/auth.jobs'

const app = express()

app.use(cors())

initFolder()

app.use(express.json())

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// app.use('/static', express.static(UPLOAD_IMAGE_DIR))

app.use(defaultErrorHandler)

export default app
