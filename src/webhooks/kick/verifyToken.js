import { refreshKickToken } from "./kick.oauth.js"

let accessToken = null
let tokenExpiresAt = 0

export async function getValidKickToken() {
  const now = Date.now()

  if (accessToken && now < tokenExpiresAt) {
    return accessToken
  }

  const refreshToken = process.env.KICK_REFRESH_TOKEN

  if (!refreshToken) {
    throw new Error('No refresh token disponible')
  }

  const tokenData = await refreshKickToken(refreshToken)

  accessToken = tokenData.access_token
  tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000)

  if (tokenData.refresh_token) {
    process.env.KICK_REFRESH_TOKEN = tokenData.refresh_token
  }

  console.log('🔄 Token refrescado correctamente')

  return accessToken
}
