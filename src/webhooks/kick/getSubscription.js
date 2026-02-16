export async function getStatus(payload,headers) {
  if (!payload) return;
  
  const eventType = `${headers.event}.${headers.type}`;
  console.log('Evento Kick:', eventType, payload);
  
  if (eventType === 'livestream.status.updated') {
    const isLive = payload.data?.is_live ?? false;
    
    console.log(isLive ? '🔴 Stream INICIADO' : '⏹️ Stream TERMINADO');
  }
}

export async function getLiveStatus() {
  try {
    return false;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

export async function verifySubscriptions(accessToken) {
  const response = await fetch(
    'https://api.kick.com/public/v1/events/subscriptions',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Get subscription error: ${error}`)
  }

  return response.json()
}