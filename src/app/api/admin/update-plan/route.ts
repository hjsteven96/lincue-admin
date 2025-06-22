import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { uid, newPlan } = await request.json();

    if (!uid || !newPlan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['free', 'plus', 'pro'].includes(newPlan)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    await adminDb.collection('users').doc(uid).update({
      plan: newPlan,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user plan:', error);
    return NextResponse.json({ error: 'Failed to update user plan' }, { status: 500 });
  }
}