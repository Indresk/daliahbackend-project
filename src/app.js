import express from 'express'
import cors from 'cors'
import AuthRouter from './routes/auth.router.js'
import { apiLimiter } from './middlewares/rateLimiters.js'
import WebhookRouter from './routes/webhooks.router.js'

const PORT = process.env.PORT

const app = express()

app.use(cors({ origin: 'https://daliahbanda.com', credentials: true }))
app.use(express.json())
app.set('trust proxy', 1)

app.use('/auth', AuthRouter)
app.use('/webhook', WebhookRouter)
app.use('/api', apiLimiter)

app.listen(PORT, () => {
    console.log(`Servidor levantado en puerto ${PORT}`)
})