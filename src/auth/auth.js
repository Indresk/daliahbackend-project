import jwt from 'jsonwebtoken'
import { addRefreshToken, removeRefreshToken, hasRefreshToken } from './tokenStore.js'

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET

export async function validateUser(email, password) {
  // Mock validation: replace with DB lookup in production
  if (!email || !password) return null
  if (email === 'test@example.com' && password === 'password') return { id: '1', email }
  return null
}

export function generateAccessToken(userId) {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' })
}

export function generateRefreshToken(userId) {
  const token = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' })
  addRefreshToken(token)
  return token
}

export function verifyRefreshToken(token) {
  if (!token) throw new Error('No token provided')
  if (!hasRefreshToken(token)) throw new Error('Refresh token revoked or unknown')
  const payload = jwt.verify(token, REFRESH_SECRET)
  return payload
}

export function revokeRefreshToken(token) {
  removeRefreshToken(token)
}

export default {validateUser, generateAccessToken,generateRefreshToken,verifyRefreshToken,revokeRefreshToken}
