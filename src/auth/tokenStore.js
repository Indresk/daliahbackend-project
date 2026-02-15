const refreshTokens = new Set()

export function addRefreshToken(token) {
  refreshTokens.add(token)
}

export function removeRefreshToken(token) {
  refreshTokens.delete(token)
}

export function hasRefreshToken(token) {
  return refreshTokens.has(token)
}

export default {
  addRefreshToken,
  removeRefreshToken,
  hasRefreshToken
}
