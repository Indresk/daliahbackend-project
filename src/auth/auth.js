import jwt from 'jsonwebtoken'
import { addRefreshToken, removeRefreshToken, hasRefreshToken } from './tokenStore.js'
import { verifyPassword } from './hashing.js'

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET

//pendiente de crear registrarse de usuarios

export async function validateUser(email, password) {
  if (!email || !password) return null
  const internalResponse = await getUser(email)
  if (await verifyPassword(password,internalResponse.password)) return { id: internalResponse.id, email}
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
