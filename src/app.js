import express from 'express'
import cors from 'cors'
import AuthRouter from './routes/auth.router.js'
import { apiLimiter } from './middlewares/rateLimiters.js'

const app = express()

app.use(cors({ origin: 'https://daliahbanda.com', credentials: true }))
app.use(express.json())

app.set('trust proxy', 1)
app.use('/auth', AuthRouter)

app.use('/api', apiLimiter)

app.listen(3023, () => {
    console.log(`Servidor levantado en puerto ${3023}`)
})