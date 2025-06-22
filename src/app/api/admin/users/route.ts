import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Check if Firebase is available
    if (!adminDb) {
      // Return mock data when Firebase is not available
      const mockUsers = [
        {
          uid: 'mock-user-1',
          email: 'user1@example.com',
          displayName: 'Mock User 1',
          plan: 'free',
          createdAt: new Date().toISOString(),
          usage: {
            analysisCount: 5,
            lastAnalysisDate: '2025-06-20'
          }
        },
        {
          uid: 'mock-user-2', 
          email: 'user2@example.com',
          displayName: 'Mock User 2',
          plan: 'plus',
          createdAt: new Date().toISOString(),
          usage: {
            analysisCount: 12,
            lastAnalysisDate: '2025-06-21'
          }
        }
      ];
      
      console.log('Firebase not available, returning mock data');
      return NextResponse.json({ users: mockUsers });
    }

    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // If Firebase error, return mock data as fallback
    const mockUsers = [
      {
        uid: 'fallback-user-1',
        email: 'fallback1@example.com',
        displayName: 'Fallback User 1',
        plan: 'free',
        createdAt: new Date().toISOString(),
        usage: {
          analysisCount: 3,
          lastAnalysisDate: '2025-06-19'
        }
      }
    ];
    
    console.log('Firebase error, returning fallback mock data');
    return NextResponse.json({ users: mockUsers });
  }
}