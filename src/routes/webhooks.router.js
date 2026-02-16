import express from 'express'
import {getStatus} from '../webhooks/kick/getSubscription.js'
import { getKickAuthUrl, exchangeCodeForToken} from '../webhooks/kick/kick.oauth.js'
import { startFlow } from '../webhooks/kick/startFlow.js'
import { savePKCE, getPKCE, clearPKCE } from '../util/pkceStorage.js';

const WebhookRouter = express.Router()

//kick

WebhookRouter.get('/kick/login', (req, res) => {
    const result = getKickAuthUrl();
    savePKCE(result.state, result.code_verifier);
    res.redirect(result.url);
})

WebhookRouter.get('/kick/oauth/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) throw new Error(`OAuth error: ${error}`);
    if (!code || !state) return res.status(400).send('Missing code or state');

    console.log('OAuth state recibido:', state);

    const codeVerifier = getPKCE(state);
    if (!codeVerifier) throw new Error('Missing code_verifier - PKCE failed');

    const tokenData = await exchangeCodeForToken(code, codeVerifier);
    process.env.KICK_REFRESH_TOKEN = tokenData.refresh_token;

    clearPKCE(state);

    const accessToken = tokenData.access_token;
    console.log('OAuth completado. Access Token:', accessToken);
    await startFlow(accessToken);
    res.send('OAuth completado y suscripción creada');
  } catch (error) {
    console.error(error);
    res.status(500).send(`OAuth error: ${error.message}`);
  }
});


WebhookRouter.post('/kick',express.json(), async (req, res) => {
  try {
    console.log('📩 Webhook recibido:', req.body)
    await getStatus(req.body,req.headers)
    res.sendStatus(200)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
})

export default WebhookRouter