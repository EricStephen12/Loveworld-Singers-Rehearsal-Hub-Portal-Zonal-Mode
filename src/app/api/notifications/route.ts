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

    // If targeting all users, create user_notifications entries
    if (target_audience === 'all') {
      try {
        const profiles = await FirebaseDatabaseService.getCollection('profiles');

        if (profiles && profiles.length > 0) {
          const userNotifications = profiles.map((profile: any) => ({
            notification_id: notificationId,
            user_id: profile.id,
            read: false,
            created_at: new Date().toISOString()
          }));

          // Save user notifications to Firebase
          for (const userNotification of userNotifications) {
            const userNotificationId = `user_notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await FirebaseDatabaseService.createDocument('user_notifications', userNotificationId, userNotification);
          }
        }
      } catch (error) {
        console.error('Error creating user notifications:', error);
        // Don't fail the request, just log the error
      }
    }

    // 🔔 TRIGGER BROWSER PUSH NOTIFICATION (NEW!)
    // This broadcasts to all connected clients to show a push notification
    try {
      // Get the origin from the request
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      // Broadcast notification event to all clients
      // This will be picked up by the client-side notification listener
      console.log('📢 Broadcasting push notification:', { title, message, type });

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

      console.log('✅ Push notification broadcast stored');
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

    // Get user notifications from Firebase
    const userNotifications = await FirebaseDatabaseService.getCollection('user_notifications');
    
    if (!userNotifications) {
      return NextResponse.json({ notifications: [] });
    }

    // Filter notifications for the specific user
    const userSpecificNotifications = userNotifications.filter((notification: any) => 
      notification.user_id === userId
    );

    // Get the actual notification details for each user notification
    const notifications = [];
    for (const userNotification of userSpecificNotifications) {
      try {
        const notification = await FirebaseDatabaseService.getDocument('notifications', (userNotification as any).notification_id);
        if (notification) {
          notifications.push({
            ...userNotification,
            notification: {
              id: (notification as any).id,
              title: (notification as any).title,
              message: (notification as any).message,
              type: (notification as any).type,
              category: (notification as any).category,
              priority: (notification as any).priority,
              action_url: (notification as any).action_url,
              expires_at: (notification as any).expires_at,
              created_at: (notification as any).created_at
            }
          });
        }
      } catch (error) {
        console.error('Error fetching notification details:', error);
        // Skip this notification if we can't fetch its details
      }
    }

    // Sort by created_at descending
    notifications.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ notifications });

  } catch (error) {
    console.error('Error in notifications GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
