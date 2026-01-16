import { NextRequest, NextResponse } from 'next/server';
import { FirebaseDatabaseService } from '@/lib/firebase-database';

export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json();

    // Validate required fields
    const { title, message, type, category, priority, target_audience, action_url, expires_at } = notificationData;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    // Create notification in Firebase
    const notification = {
      title,
      message,
      type: type || 'info',
      category: category || 'system',
      priority: priority || 'medium',
      target_audience: target_audience || 'all',
      action_url,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Generate a unique ID for the notification
    const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save to Firebase
    await FirebaseDatabaseService.createDocument('notifications', notificationId, notification);

    // OPTIMIZED: For "all" users, we DON'T create individual user_notifications
    // Instead, we rely on the notification's target_audience field
    // Users will see notifications where target_audience === 'all' OR they have a user_notification entry
    // This saves MASSIVE Firebase writes (1 write vs N writes where N = number of users)
    if (target_audience === 'all') {
      // The notification itself with target_audience='all' is sufficient
      // Client-side filtering will show this to all users
    }

    // 🔔 TRIGGER BROWSER PUSH NOTIFICATION (NEW!)
    // This broadcasts to all connected clients to show a push notification
    try {
      // Get the origin from the request
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      // Broadcast notification event to all clients
      // This will be picked up by the client-side notification listener

      // Store in a special collection for real-time push notifications
      const pushNotificationData = {
        ...notification,
        notificationId,
        timestamp: Date.now(),
        broadcast: true
      };

      await FirebaseDatabaseService.createDocument(
        'push_notifications',
        `push_${notificationId}`,
        pushNotificationData
      );

    } catch (pushError) {
      console.error('⚠️ Error broadcasting push notification (non-critical):', pushError);
      // Don't fail the request if push notification fails
    }

    return NextResponse.json({
      success: true,
      notification: { id: notificationId, ...notification },
      message: 'Notification created successfully'
    });

  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // OPTIMIZED: Use Firestore query instead of fetching all and filtering
    const userSpecificNotifications = await FirebaseDatabaseService.getCollectionWhere(
      'user_notifications',
      'user_id',
      '==',
      userId
    );
    
    if (!userSpecificNotifications || userSpecificNotifications.length === 0) {
      return NextResponse.json({ notifications: [] });
    }

    // OPTIMIZED: Batch fetch notification details instead of one-by-one
    const notificationIds = [...new Set(userSpecificNotifications.map((n: any) => n.notification_id))];
    const notificationDetails = await FirebaseDatabaseService.getDocumentsByIds('notifications', notificationIds);
    const notificationMap = new Map(notificationDetails.map((n: any) => [n.id, n]));

    // Map user notifications with their details
    const notifications = userSpecificNotifications
      .map((userNotification: any) => {
        const notification = notificationMap.get(userNotification.notification_id);
        if (!notification) return null;
        return {
          ...userNotification,
          notification: {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            category: notification.category,
            priority: notification.priority,
            action_url: notification.action_url,
            expires_at: notification.expires_at,
            created_at: notification.created_at
          }
        };
      })
      .filter(Boolean);

    // Sort by created_at descending
    notifications.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ notifications });

  } catch (error) {
    console.error('Error in notifications GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
