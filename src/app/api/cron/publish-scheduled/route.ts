import { NextRequest, NextResponse } from "next/server";
import {
  publishScheduledReviews,
  publishScheduledEventReports,
} from "@/features/content/server/scheduled-publish-actions";
import { logger } from "@/lib/logger";
import { assertCronAuth } from "@/lib/security/cron-auth";

/**
 * Cron endpoint to publish scheduled content
 * This should be called periodically (e.g., every 5 minutes) by a cron service
 *
 * Example with Vercel Cron (vercel.json):
 * {
 *   "crons": [{ "path": "/api/cron/publish-scheduled", "schedule": "every 5 minutes" }]
 * }
 */
export async function GET(request: NextRequest) {
  const authError = assertCronAuth(request);
  if (authError) return authError;

  try {
    const reviewsPublished = await publishScheduledReviews();
    const reportsPublished = await publishScheduledEventReports();

    return NextResponse.json({
      success: true,
      reviewsPublished,
      reportsPublished,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ err: error }, "Cron publish-scheduled failed");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
