// /pages/api/send-call-notification.js
// Simple working implementation without TypeScript issues

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { receiverId, title, body, data } = req.body;

    // For immediate testing - log the notification request
    console.log('[CallNotification] Sending to:', receiverId);
    console.log('[CallNotification] Title:', title);
    console.log('[CallNotification] Body:', body);
    console.log('[CallNotification] Data:', data);

    // TODO: Implement actual FCM token lookup and sending
    // This requires storing user FCM tokens in your database
    
    // Mock successful response for testing
    res.status(200).json({
      success: true,
      message: 'Notification queued for delivery',
      receiverId: receiverId,
      timestamp: new Date().toISOString()
    });

    // In production, you would:
    // 1. Look up user's FCM tokens from database
    // 2. Send via Firebase Admin SDK
    // 3. Handle response and errors

  } catch (error) {
    console.error('[CallNotification] Error:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      message: error.message 
    });
  }
}