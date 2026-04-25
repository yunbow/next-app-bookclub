/**
 * RSS feed parser for book news
 */

export interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: Date;
  category?: string;
  author?: string;
  guid?: string;
}

export interface RSSFeed {
  title: string;
  description?: string;
  link: string;
  items: RSSItem[];
}

/**
 * Parse RSS feed from URL
 */
export async function parseRSSFeed(url: string): Promise<RSSFeed | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('Failed to fetch RSS feed:', response.statusText);
      return null;
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      return null;
    }

    // Extract channel info
    const channel = xmlDoc.querySelector('channel');
    if (!channel) {
      console.error('No channel element found in RSS feed');
      return null;
    }

    const feedTitle = channel.querySelector('title')?.textContent || '';
    const feedDescription = channel.querySelector('description')?.textContent || '';
    const feedLink = channel.querySelector('link')?.textContent || '';

    // Extract items
    const itemElements = xmlDoc.querySelectorAll('item');
    const items: RSSItem[] = [];

    itemElements.forEach((item) => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const pubDateStr = item.querySelector('pubDate')?.textContent;
      const category = item.querySelector('category')?.textContent || '';
      const author = item.querySelector('author')?.textContent || '';
      const guid = item.querySelector('guid')?.textContent || '';

      items.push({
        title,
        link,
        description,
        pubDate: pubDateStr ? new Date(pubDateStr) : undefined,
        category,
        author,
        guid,
      });
    });

    return {
      title: feedTitle,
      description: feedDescription,
      link: feedLink,
      items,
    };
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return null;
  }
}

/**
 * Categorize RSS items based on keywords
 */
export function categorizeRSSItems(items: RSSItem[]): Map<string, RSSItem[]> {
  const categories = new Map<string, RSSItem[]>();

  const categoryKeywords: Record<string, string[]> = {
    '新刊': ['新刊', '発売', 'リリース', '刊行'],
    'ベストセラー': ['ベストセラー', '売れ筋', 'ランキング', '人気'],
    'レビュー': ['レビュー', '書評', '感想', '評価'],
    'イベント': ['イベント', 'フェア', 'サイン会', '講演'],
    '文学賞': ['文学賞', '受賞', 'ノミネート', '候補'],
    'インタビュー': ['インタビュー', '対談', '著者に聞く'],
  };

  items.forEach((item) => {
    const text = `${item.title} ${item.description || ''} ${item.category || ''}`.toLowerCase();
    let categorized = false;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category)!.push(item);
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      if (!categories.has('その他')) {
        categories.set('その他', []);
      }
      categories.get('その他')!.push(item);
    }
  });

  return categories;
}

/**
 * Common book-related RSS feed URLs (examples)
 */
export const BOOK_RSS_FEEDS = [
  {
    name: '出版ニュース',
    url: 'https://example.com/book-news/rss',
    description: '最新の出版ニュース',
  },
  {
    name: '新刊情報',
    url: 'https://example.com/new-releases/rss',
    description: '新刊書籍の情報',
  },
  {
    name: '書評',
    url: 'https://example.com/book-reviews/rss',
    description: '書評・レビュー',
  },
];
