import crypto from 'crypto';
import getRawBody from 'raw-body';

async function verifyKickWebhook(publicKeyBase64, signatureBase64, rawBody) {
    try {
        const publicKeyBuffer = Buffer.from(publicKeyBase64, 'base64');
        
        const isValid = crypto.verify(
            null,
            Buffer.from(rawBody, 'utf8'),
            {key: publicKeyBuffer,format: 'der',type: 'spki'},
            Buffer.from(signatureBase64, 'base64')
        );
        
        console.log('✅ Verificación Kick:', isValid ? 'VÁLIDA' : 'INVÁLIDA');
        return isValid;
    } 
    catch (error) {
        console.error('Error crypto Kick:', error.message);
        console.error('Key bytes:', publicKeyBase64.length, 'Sig bytes:', signatureBase64.length);
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

    // Activar cuando todo este funcionando bien*
    //if (!signature)return res.status(401).json({ error: 'Signature requerida' });

    console.log('KICK_PUBLIC_KEY preview:', process.env.KICK_PUBLIC_KEY.substring(0, 30));
    console.log('Key length bytes:', Buffer.from(process.env.KICK_PUBLIC_KEY, 'base64').length);

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