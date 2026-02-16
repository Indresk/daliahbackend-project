import crypto from 'crypto';
import getRawBody from 'raw-body';

async function verifyKickWebhook(publicKeyBase64, signatureBase64, rawBody) {
  try {

    const publicKeyData = Uint8Array.from(atob(publicKeyBase64), (c) => c.charCodeAt(0));
    
    const publicKey = await crypto.subtle.importKey(
        'raw',
        publicKeyData,
        { name: 'Ed25519', namedCurve: 'Ed25519' },
        false,
        ['verify']
    );
    
    const signature = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
        'Ed25519',
        publicKey,
        signature,
        new TextEncoder().encode(rawBody)
    );
    
        return isValid;
    } catch (error) {
        console.error('Error verificando webhook Kick:', error);
        return false;
    }
}

const kickWebhookMiddleware = async (req, res, next) => {
  if (req.method !== 'POST') return next();
  try {
    const rawBody = await getRawBody(req);
    req.rawBody = rawBody.toString('utf8');

    const signature = req.headers['kick-event-signature'];
    const publicKey = process.env.KICK_PUBLIC_KEY;

    if (signature && publicKey) {
        const isValid = await verifyKickWebhook(publicKey, signature, req.rawBody);
        if (!isValid) {
        console.log('Firma Kick inválida');
        return res.status(401).json({ error: 'Firma inválida' });
        }
        console.log('Firma Kick verificada');
    }
    req.body = JSON.parse(req.rawBody);
    next();
    } catch (error) {
        console.error('Error middleware webhook:', error);
        res.status(400).json({ error: 'Body inválido' });
    }
};

export default kickWebhookMiddleware