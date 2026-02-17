import { getGeneralData } from "../../db/firebase.js"
import { refreshKickToken } from "./kick.oauth.js"

let accessToken = null
let tokenExpiresAt = 0

//cambiar flujo: 0.Revisión de fecha de vencimiento con fecha actual desde DB. 1. Revisión si puede acceder con el accesstoken actual desde DB. 2.Si no solicitar refresh y almacenar nuevo access token en DB

export async function getValidKickToken() {
  const now = Date.now()

  if (accessToken && now < tokenExpiresAt) {
    return accessToken
  }

  const refreshToken = await getGeneralData("live","kickRefreshToken")

  if (!refreshToken) {
    throw new Error('No refresh token disponible')
  }

  const tokenData = await refreshKickToken(refreshToken)

  accessToken = tokenData.access_token
  tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000)

  if (tokenData.refresh_token) {
    await updateGeneralData("live",{kickRefreshToken:tokenData.refresh_token})
  }

  console.log('🔄 Token refrescado correctamente')

  return accessToken
}
