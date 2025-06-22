import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ videoId: string }> }) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const { videoId } = await params;
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const doc = await adminDb.collection('videoAnalyses').doc(videoId).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = {
      id: doc.id,
      ...doc.data(),
    };

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}