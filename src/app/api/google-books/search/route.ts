import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchGoogleBooks, searchByISBN } from "@/lib/google-books";
import { logger } from "@/lib/logger";
import { z } from "zod";

const SearchSchema = z.object({
  q: z.string().min(1).max(200).optional().nullable(),
  isbn: z.string().regex(/^[\d-]{10,17}$/).optional().nullable(),
  maxResults: z.coerce.number().int().min(1).max(40).default(10).catch(10),
}).refine((data) => data.q || data.isbn, {
  message: "Either query or ISBN is required",
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const isbn = searchParams.get("isbn");
    const maxResults = searchParams.get("maxResults");

    const parsed = SearchSchema.safeParse({
      q: query,
      isbn: isbn,
      maxResults: maxResults,
    });

    if (!parsed.success) {
      logger.warn(
        { validation: parsed.error.issues },
        "Google Books API validation failed"
      );
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    let results;
    if (parsed.data.isbn) {
      const book = await searchByISBN(parsed.data.isbn);
      results = book ? [book] : [];
    } else if (parsed.data.q) {
      results = await searchGoogleBooks(parsed.data.q, parsed.data.maxResults);
    }

    const resultCount = Array.isArray(results)
      ? results.length
      : results?.items?.length || 0;

    logger.info(
      { query: parsed.data.q, isbn: parsed.data.isbn, resultCount },
      "Google Books search completed"
    );

    return NextResponse.json(results || []);
  } catch (error) {
    logger.error({ err: error }, "Google Books API error");
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to search books" } },
      { status: 500 }
    );
  }
}
