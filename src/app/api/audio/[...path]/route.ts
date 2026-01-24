import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await the params in Next.js 15
    const resolvedParams = await params;
    
    // Reconstruct the original Cloudinary URL
    const cloudinaryUrl = `https://res.cloudinary.com/${resolvedParams.path.join('/')}`;
    
    console.log('🎵 Proxying audio request:', cloudinaryUrl);
    
    // Fetch the audio file from Cloudinary
    const response = await fetch(cloudinaryUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }
    
    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    
    // Return the audio with proper headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
        'Content-Length': response.headers.get('Content-Length') || '',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error proxying audio:', error);
    return NextResponse.json({ error: 'Failed to load audio' }, { status: 500 });
  }
}