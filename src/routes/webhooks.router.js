import express from 'express'
import {getStatus} from '../webhooks/kick/getSubscription.js'
import { getKickAuthUrl, exchangeCodeForToken} from '../webhooks/kick/kick.oauth.js'
import { startFlow } from '../webhooks/kick/startFlow.js'
import { savePKCE, getPKCE, clearPKCE } from '../util/pkceStorage.js';
import kickWebhookMiddleware from '../webhooks/kick/verifyWebhook.js';
import { updateGeneralData } from '../db/firebase.js';

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

    const codeVerifier = getPKCE(state);
    if (!codeVerifier) throw new Error('Missing code_verifier - PKCE failed');

    const tokenData = await exchangeCodeForToken(code, codeVerifier);

    await updateGeneralData("live",{kickRefreshToken:tokenData.refresh_token})
    //pendiente - almacenar tambien datos de fecha de caducidad 2meses*

    clearPKCE(state);

    //almacenar access token en DB
    const accessToken = tokenData.access_token;
    await startFlow(accessToken);
    res.send('OAuth completado y suscripción creada');
  } catch (error) {
    console.error(error);
    res.status(500).send(`OAuth error: ${error.message}`);
  }
});


WebhookRouter.post('/kick',kickWebhookMiddleware, async (req, res) => {
  try {
    //Llamar verifyToken una vez vinculada la recuperación de refresh token de DB
    console.log('📩 Webhook recibido')
    await getStatus(req.body)
    res.sendStatus(200)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
})

export default WebhookRouter