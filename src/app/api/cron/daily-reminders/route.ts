import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-setup';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { authedFetch } from '@/lib/authed-fetch';
import moment from 'moment';

export async function GET(request: Request) {
  try {
    // Basic security: Only allow Vercel Cron or a secret key to trigger this
    const authHeader = request.headers.get('authorization');
    if (
      authHeader !== `Bearer ${process.env.CRON_SECRET}` && 
      request.headers.get('x-vercel-cron') !== '1' // Vercel automatically sends this header
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStr = moment().startOf('day').toISOString();
    const now = moment();
    
    // 1. Fetch all events that might be active today
    // We fetch all upcoming events from the central notifications collection
    // because that's where the calendar reads from, and it has the zone routing info.
    const notificationsRef = collection(db, 'notifications');
    const snapshot = await getDocs(notificationsRef);
    
    let sentCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Only process events that have a start and end date
      if (!data.event_start_date || !data.event_end_date) continue;
      
      const startDate = moment(data.event_start_date).startOf('day');
      const endDate = moment(data.event_end_date).endOf('day');
      
      // If today is exactly within the range of this multi-day event
      if (now.isBetween(startDate, endDate, 'day', '[]')) {
        
        // Skip if it's the very first day (because the admin already sent a push when creating it)
        if (now.isSame(startDate, 'day')) {
          continue; 
        }

        // Determine who gets this notification
        let recipientIds: string[] = [];
        
        if (data.target_audience === 'all') {
          // Global Event: Send to EVERYONE
          const allZonesRef = collection(db, 'profiles');
          const allSnaps = await getDocs(allZonesRef);
          recipientIds = allSnaps.docs.map(d => d.id).filter(Boolean);
        } else if (data.zoneId) {
          // Zone Specific Event: Get only members of this zone
          // The database schema might vary, but usually zone_members or profiles with zone_code
          const membersRef = collection(db, 'zone_members');
          const q = query(membersRef, where('zoneId', '==', data.zoneId));
          const zoneSnaps = await getDocs(q);
          recipientIds = zoneSnaps.docs.map(d => d.data().userId).filter(Boolean);
          
          // Fallback if schema is on profiles directly
          if (recipientIds.length === 0) {
            const profileRef = collection(db, 'profiles');
            const profileQ = query(profileRef, where('zone_code', '==', data.zoneId));
            const pSnaps = await getDocs(profileQ);
            recipientIds = pSnaps.docs.map(d => d.id).filter(Boolean);
          }
        }
        
        if (recipientIds.length > 0) {
          // Send the push notification
          const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://loveworld-singers-rehearsal-hub.vercel.app';
          await fetch(`${origin}/api/send-notification`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              // Use a service account or internal secret if required by authedFetch
              'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET}` 
            },
            body: JSON.stringify({
              type: 'calendar',
              recipientIds,
              title: `📅 Today: ${data.title || 'Event'}`,
              body: `Reminder: "${data.title}" is happening today!`,
              data: { eventId: data.data?.eventId || '', type: data.data?.type || 'event' }
            })
          });
          sentCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Daily reminder cron completed. Sent ${sentCount} reminders.` 
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
