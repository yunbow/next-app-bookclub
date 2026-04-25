import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { awardDailyLoginXP } from '@/features/gamification/server/xp-actions';

/**
 * Award daily login XP
 * Call this endpoint when user logs in or visits the app
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await awardDailyLoginXP(session.user.id);

    if (!result) {
      return NextResponse.json({
        success: true,
        message: 'Already received daily login XP today',
        alreadyAwarded: true,
      });
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error awarding daily login XP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
