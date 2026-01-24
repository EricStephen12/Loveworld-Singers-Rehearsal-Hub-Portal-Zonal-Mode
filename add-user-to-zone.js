// Quick script to add a user to a zone
// Run with: node add-user-to-zone.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need your service account key)
// Download from: Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addUserToZone() {
  const userId = 'I1MdHTY7iQUGR95YPIwKAY9jGdG2'; // The user ID from logs
  const userEmail = 'mkvunknown@gmail.com';
  const zoneId = 'zone-001'; // Your Loveworld Singers (HQ Group)
  const zoneName = 'Your Loveworld Singers';
  
  try {
    // Create zone membership document
    const membershipId = `${userId}_${zoneId}`;
    
    await db.collection('zone_members').doc(membershipId).set({
      userId: userId,
      userEmail: userEmail,
      zoneId: zoneId,
      zoneName: zoneName,
      role: 'member', // or 'coordinator' if they should be coordinator
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });
    
    console.log('✅ User added to zone successfully!');
    console.log(`User: ${userEmail}`);
    console.log(`Zone: ${zoneName} (${zoneId})`);
    
    // Also update the user's profile with zone info
    await db.collection('profiles').doc(userId).update({
      zoneId: zoneId,
      zoneName: zoneName,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ User profile updated with zone info');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

addUserToZone();
