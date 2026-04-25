"use server";

import { parseRSSFeed, categorizeRSSItems, BOOK_RSS_FEEDS, type RSSItem } from "@/lib/rss-parser";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import type { ActionResult } from "@/lib/types/action-result";

const ALLOWED_FEED_URLS = BOOK_RSS_FEEDS.map((f) => f.url);

type NewsItem = RSSItem & {
  feedName?: string;
  feedDescription?: string;
};

/**
 * Get book news from RSS feeds
 */
export async function getBookNews(limit: number = 20): Promise<ActionResult<NewsItem[]>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const allItems: NewsItem[] = [];

    // Fetch from all configured RSS feeds
    for (const feedConfig of BOOK_RSS_FEEDS) {
      const feed = await parseRSSFeed(feedConfig.url);
      if (feed) {
        feed.items.forEach((item) => {
          allItems.push({
            ...item,
            feedName: feedConfig.name,
            feedDescription: feedConfig.description,
          } as NewsItem);
        });
      }
    }

    // Sort by date (newest first)
    allItems.sort((a, b) => {
      if (!a.pubDate) return 1;
      if (!b.pubDate) return -1;
      return b.pubDate.getTime() - a.pubDate.getTime();
    });

    return { success: true, data: allItems.slice(0, limit) };
  });
}

/**
 * Get categorized book news
 */
export async function getCategorizedBookNews(): Promise<ActionResult<Record<string, NewsItem[]>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const allItems: NewsItem[] = [];

    // Fetch from all configured RSS feeds
    for (const feedConfig of BOOK_RSS_FEEDS) {
      const feed = await parseRSSFeed(feedConfig.url);
      if (feed) {
        allItems.push(...feed.items);
      }
    }

    const categorized = categorizeRSSItems(allItems);

    // Convert Map to object for JSON serialization
    const result: Record<string, NewsItem[]> = {};
    categorized.forEach((items, category) => {
      result[category] = items.slice(0, 10); // Limit per category
    });

    return { success: true, data: result };
  });
}

/**
 * Get news from a specific RSS feed
 */
export async function getNewsByFeed(
  feedUrl: string,
  limit: number = 20
): Promise<ActionResult<{ title: string; description: string | undefined; link: string; items: RSSItem[] }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    // SSRF prevention: only allow configured feed URLs
    if (!ALLOWED_FEED_URLS.includes(feedUrl)) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "許可されていないフィードURLです" },
      };
    }

    const feed = await parseRSSFeed(feedUrl);
    if (!feed) {
      return {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "フィードの取得に失敗しました" },
      };
    }

    return {
      success: true,
      data: {
        title: feed.title,
        description: feed.description,
        link: feed.link,
        items: feed.items.slice(0, limit),
      },
    };
  });
}
