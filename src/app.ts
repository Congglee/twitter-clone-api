import express from 'express'

const app = express()

const port = 3000

app.use(express.json())

export default app
