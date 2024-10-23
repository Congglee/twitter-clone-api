import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { openapiSpecification } from '~/docs/swagger'

const docsRouter = Router()

docsRouter.use('/', swaggerUi.serve)

// Using YAML file
// docsRouter.get('/', swaggerUi.setup(swaggerDocument))

// Using OpenAPI specification object from swagger-jsdoc
docsRouter.get('/', swaggerUi.setup(openapiSpecification))

export default docsRouter
