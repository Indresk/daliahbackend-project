import crypto from 'crypto';  

const { KICK_CLIENT_ID, KICK_CLIENT_SECRET, KICK_REDIRECT_URI, KICK_TOKEN_URL, KICK_AUTH_URL } = process.env;

export function generatePKCEPair() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { code_verifier: verifier, code_challenge: challenge };
}

export function getKickAuthUrl(state = crypto.randomUUID()) { 
  const pkce = generatePKCEPair(); 
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: KICK_CLIENT_ID,
    redirect_uri: KICK_REDIRECT_URI,
    scope: 'events:subscribe livestream:read',
    code_challenge: pkce.code_challenge,  
    code_challenge_method: 'S256',        
    state: state                          
  });
  const url = `${KICK_AUTH_URL}?${params.toString()}`
  return { url, state, code_verifier: pkce.code_verifier };
}

export async function exchangeCodeForToken(code, codeVerifier) { 
  const response = await fetch(KICK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: KICK_CLIENT_ID,
      client_secret: KICK_CLIENT_SECRET,
      redirect_uri: KICK_REDIRECT_URI,
      code_verifier: codeVerifier
    }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  return response.json();
}

export async function refreshKickToken(refreshToken) {
  const response = await fetch(KICK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: KICK_CLIENT_ID,
      client_secret: KICK_CLIENT_SECRET,
    }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Refresh token failed: ${error}`);
  }
  return response.json();
}