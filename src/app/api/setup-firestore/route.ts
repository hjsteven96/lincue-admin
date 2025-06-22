import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST() {
  try {
    console.log('Setting up Firestore database...');
    
    if (!adminDb) {
      return NextResponse.json({ 
        error: 'Firebase admin not initialized',
        message: 'Please check your Firebase configuration'
      }, { status: 500 });
    }

    // Create initial collections with sample documents
    const batch = adminDb.batch();

    // Create a system collection to initialize the database
    const systemRef = adminDb.collection('system').doc('config');
    batch.set(systemRef, {
      initialized: true,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    });

    // Create a sample user document
    const userRef = adminDb.collection('users').doc('sample-user');
    batch.set(userRef, {
      uid: 'sample-user',
      email: 'sample@example.com',
      displayName: 'Sample User',
      plan: 'free',
      createdAt: new Date().toISOString(),
      usage: {
        analysisCount: 0,
        lastAnalysisDate: null
      }
    });

    // Create a sample video analysis document
    const videoRef = adminDb.collection('videoAnalyses').doc('sample-video');
    batch.set(videoRef, {
      videoId: 'sample-video',
      youtubeTitle: 'Sample Video',
      youtubeDescription: 'This is a sample video for testing',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      duration: 300,
      timestamp: new Date().toISOString(),
      analysis: {
        summary: 'Sample analysis',
        keywords: ['sample', 'test'],
        slang_expressions: [],
        main_questions: []
      },
      transcript_text: 'Sample transcript'
    });

    // Execute batch write
    await batch.commit();
    console.log('Firestore setup completed successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Firestore database setup completed',
      collections: ['system', 'users', 'videoAnalyses']
    });

  } catch (error) {
    console.error('Firestore setup error:', error);
    return NextResponse.json({ 
      error: 'Firestore setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}