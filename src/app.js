import express from 'express'
import cors from 'cors'
import AuthRouter from './routes/auth.router.js'
import { apiLimiter } from './middlewares/rateLimiters.js'
import WebhookRouter from './routes/webhooks.router.js'

const PORT = process.env.PORT

const app = express()


app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  console.log('Origen de la request:', origin);
  
  const allowedOrigins = ['https://daliahbanda.com', 'http://localhost:3000'];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});


// app.use(cors({ origin: 'https://daliahbanda.com', credentials: true }))
app.use(express.json())
app.set('trust proxy', 1)

app.use('/auth', AuthRouter)
app.use('/webhook', WebhookRouter)
app.use('/api', apiLimiter)

app.listen(PORT, () => {
    console.log(`Servidor levantado en puerto ${PORT}`)
})