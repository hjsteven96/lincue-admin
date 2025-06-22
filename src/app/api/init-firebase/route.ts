import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST() {
  try {
    console.log('Initializing Firebase database...');
    
    if (!adminDb) {
      return NextResponse.json({ 
        error: 'Firebase admin not initialized' 
      }, { status: 500 });
    }

    // Try to create a test document to initialize the database
    const testDoc = {
      type: 'initialization',
      timestamp: new Date().toISOString(),
      message: 'Database initialized'
    };

    // Create a test document in a system collection
    await adminDb.collection('system').doc('init').set(testDoc);
    console.log('Database initialization successful');

    // Now try to read it back
    const doc = await adminDb.collection('system').doc('init').get();
    
    if (doc.exists) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully',
        data: doc.data()
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to verify database initialization' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ 
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}