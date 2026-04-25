import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { logger } from '@/lib/logger';
import { initializeBadges } from '@/features/badge/server/badge-actions';

/**
 * Initialize all badges in the database
 * This should be called once during setup
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 }
      );
    }

    const result = await initializeBadges();
    if (!result.success) {
      const statusMap: Record<string, number> = {
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        VALIDATION_ERROR: 400,
      };
      const status = statusMap[result.error.code] || 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: `Initialized ${result.data.count} badges`,
    });
  } catch (error) {
    logger.error({ err: error }, "Error initializing badges");
    return NextResponse.json(
      { error: 'Failed to initialize badges' },
      { status: 500 }
    );
  }
}
