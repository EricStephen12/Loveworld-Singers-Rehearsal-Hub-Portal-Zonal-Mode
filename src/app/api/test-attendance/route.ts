import { NextResponse } from 'next/server';
import { FirebaseDatabaseService } from '@/lib/firebase-database';

export async function GET() {
  try {
    const allRecords = await FirebaseDatabaseService.getAllFromCollection('attendance');
    return NextResponse.json({ success: true, count: allRecords.length, records: allRecords });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
