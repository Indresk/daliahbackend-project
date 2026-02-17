import express from 'express'
import cookieParser from 'cookie-parser'
import { validateUser,generateAccessToken,generateRefreshToken,verifyRefreshToken,revokeRefreshToken} from '../auth/auth.js'
import { loginLimiter,refreshLimiter } from '../middlewares/rateLimiters.js'

const AuthRouter = express.Router()

AuthRouter.use(cookieParser())
AuthRouter.use(express.json())

//pendiente de crear registrarse de usuarios

AuthRouter.post('/login',loginLimiter, async (req, res) => {
  const { email, password } = req.body

  const user = await validateUser(email, password)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/auth/refresh',
    domain: '.daliahbanda.com'
  })

  res.json({ accessToken })
})

AuthRouter.post('/refresh',refreshLimiter, (req, res) => {
  const token = req.cookies.refreshToken
  if (!token) return res.sendStatus(401)

  try {
    const payload = verifyRefreshToken(token)
    const newAccessToken = generateAccessToken(payload.userId)
    res.json({ accessToken: newAccessToken })
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }
})

AuthRouter.post('/logout', (req, res) => {
  const token = req.cookies.refreshToken
  if (token) {
    revokeRefreshToken(token)
    res.clearCookie('refreshToken', { path: '/auth/refresh', httpOnly: true, secure: true, sameSite: 'strict',domain: '.daliahbanda.com' })
  }
  res.sendStatus(204)
})

export default AuthRouter