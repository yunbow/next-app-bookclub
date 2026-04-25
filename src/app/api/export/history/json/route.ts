import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { logger } from '@/lib/logger';
import { exportReadingHistoryAsJSON } from '@/features/export/server/export-actions';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 }
      );
    }

    const result = await exportReadingHistoryAsJSON();
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

    return new NextResponse(result.data, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="reading-history-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Error exporting reading history");
    return NextResponse.json(
      { error: 'Failed to export reading history' },
      { status: 500 }
    );
  }
}
