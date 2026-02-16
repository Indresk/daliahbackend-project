export async function startFlow(accessToken) {
  
  const response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
    method: 'POST',
     headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': '*/*'
    },
    body: JSON.stringify({
      broadcaster_user_id: 87378324,
      events: [
        {
          name: 'livestream.status.updated',
          version: 1
        }
      ],
      method: 'webhook'
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Kick API Error Details:', error);
    throw new Error(`Kick subscription error: ${error}`);
  }
  
  console.log('Subscription creada OK:', await response.json());
  return response.json();
}