import crypto from 'crypto';
import getRawBody from 'raw-body';

async function verifyKickWebhook(publicKeyPem,signatureBase64, messageId, timestamp, rawBody) {
    try {
        const toSign = `${messageId}.${timestamp}.${rawBody}`;
        
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(toSign);
        
        const signatureBuffer = Buffer.from(signatureBase64, 'base64');
        const isValid = verifier.verify(publicKeyPem, signatureBuffer);

        return isValid;
    } 
    catch (error) {
        console.error('Error crypto Kick:', error.message);
        return false;
    }
}

const kickWebhookMiddleware = async (req, res, next) => {
  if (req.method !== 'POST') return next();
  try {
    const rawBody = await getRawBody(req);
    req.rawBody = rawBody.toString('utf8');

    const publicKey = process.env.KICK_PUBLIC_KEY;
    const signature = req.headers['kick-event-signature'];
    const messageId = req.headers['kick-event-message-id'];
    const timestamp = req.headers['kick-event-message-timestamp'];
    
    if (!signature)return res.status(401).json({ error: 'Signature requerida' });

    if (signature && publicKey) {
        const isValid = await verifyKickWebhook(publicKey,signature,messageId, timestamp, req.rawBody);
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