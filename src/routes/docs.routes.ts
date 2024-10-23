import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { openapiSpecification } from '~/docs/swagger'

const docsRouter = Router()

docsRouter.use('/', swaggerUi.serve)
docsRouter.get('/', swaggerUi.setup(openapiSpecification))

export default docsRouter
