/**
 * Google Books API Integration
 * https://developers.google.com/books/docs/v1/using
 */

import { logger } from "@/lib/logger";

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBook[];
  totalItems: number;
}

/**
 * Search books by query (title, author, ISBN, etc.)
 */
export async function searchGoogleBooks(
  query: string,
  maxResults: number = 10
): Promise<GoogleBooksResponse> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", Math.min(maxResults, 10).toString());
  url.searchParams.set("langRestrict", "ja"); // 日本語優先
  
  // Add API key if available
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }

  try {
    const response = await fetch(url.toString(), {
      // キャッシュを24時間に設定してレート制限を軽減
      next: { revalidate: 86400 },
    });

    if (response.status === 429) {
      logger.warn(
        { status: response.status, query, hasApiKey: !!apiKey },
        "Google Books API rate limit exceeded"
      );
      return { totalItems: 0, items: [] };
    }

    if (!response.ok) {
      logger.error(
        { status: response.status, statusText: response.statusText, query },
        "Google Books API error"
      );
      return { totalItems: 0, items: [] };
    }

    return await response.json();
  } catch (error) {
    logger.error({ err: error, query }, "Error fetching from Google Books API");
    return { totalItems: 0, items: [] };
  }
}

/**
 * Search books by ISBN
 */
export async function searchByISBN(isbn: string): Promise<GoogleBook | null> {
  const cleanISBN = isbn.replace(/[-\s]/g, "");
  const response = await searchGoogleBooks(`isbn:${cleanISBN}`, 1);
  
  return response.items?.[0] || null;
}

/**
 * Get book by Google Books ID
 */
export async function getBookById(id: string): Promise<GoogleBook | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = new URL(`https://www.googleapis.com/books/v1/volumes/${id}`);
  
  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (response.status === 429) {
      logger.warn(
        { status: response.status, bookId: id },
        "Google Books API rate limit exceeded"
      );
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    logger.error({ err: error, bookId: id }, "Error fetching book by ID");
    return null;
  }
}

/**
 * Convert Google Book to our Book format
 */
export function convertGoogleBookToBook(googleBook: GoogleBook) {
  const { volumeInfo } = googleBook;
  
  // Extract ISBN
  const isbn13 = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === "ISBN_13"
  )?.identifier;
  const isbn10 = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === "ISBN_10"
  )?.identifier;
  const isbn = isbn13 || isbn10;

  // Extract published year
  const publishedYear = volumeInfo.publishedDate
    ? parseInt(volumeInfo.publishedDate.split("-")[0])
    : undefined;

  // Get best quality image
  const coverImage =
    volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") ||
    volumeInfo.imageLinks?.smallThumbnail?.replace("http://", "https://");

  return {
    isbn,
    title: volumeInfo.title,
    author: volumeInfo.authors?.join(", "),
    publisher: volumeInfo.publisher,
    publishedYear,
    description: volumeInfo.description,
    coverImage,
    pages: volumeInfo.pageCount,
    category: volumeInfo.categories?.[0],
  };
}
