import { Router } from 'express'
import { loginController } from '~/controllers/users.middlewares'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)

export default usersRouter
