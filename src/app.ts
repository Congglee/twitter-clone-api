import express from 'express'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import authRouter from '~/routes/auth.routes'
import usersRouter from '~/routes/users.routes'

const app = express()

app.use(express.json())

app.use('/auth', authRouter)
app.use('/users', usersRouter)

app.use(defaultErrorHandler)

export default app
