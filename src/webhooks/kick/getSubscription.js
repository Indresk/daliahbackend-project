import { updateGeneralData } from "../../db/firebase.js";

export async function getStatus(payload) {
  if (!payload) return;
  console.log('Evento Kick:', payload);
  const isLive = payload.data?.is_live ?? false;
  console.log(payload.data?.is_live)
  console.log(payload.is_live)
  await updateGeneralData('live',{status:isLive})
  console.log(isLive ? '🔴 Stream INICIADO' : '⏹️ Stream TERMINADO');
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