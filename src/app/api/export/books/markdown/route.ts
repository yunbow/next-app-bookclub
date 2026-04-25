import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { logger } from '@/lib/logger';
import { exportBooksAsMarkdown } from '@/features/export/server/export-actions';
import { getUserPlan, hasMinPlan } from '@/lib/subscription';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 }
      );
    }

    const plan = await getUserPlan(session.user.id);
    if (!hasMinPlan(plan, "premium")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "データエクスポートはPremiumプランが必要です" } },
        { status: 403 }
      );
    }

    const result = await exportBooksAsMarkdown();
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
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="books-${new Date().toISOString().split('T')[0]}.md"`,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Error exporting books as Markdown");
    return NextResponse.json(
      { error: 'Failed to export books' },
      { status: 500 }
    );
  }
}
