import { http, HttpResponse, type HttpHandler } from "msw";

/**
 * Canonical Google Books API mock factory.
 *
 * The bookclub app hits `www.googleapis.com/books/v1/volumes` to resolve
 * ISBN lookups and keyword searches. Tests that touch that code path can
 * import `googleBooksHandlers()` into their `setupServer(...)` to get
 * deterministic results without a live HTTP call.
 *
 * Only the `volumes.list` (search) and `volumes.get` (by ID) endpoints
 * are covered — extend as new call-sites appear.
 */

export type MakeVolumeOptions = {
  id?: string;
  title?: string;
  authors?: string[];
  isbn10?: string;
  isbn13?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  thumbnail?: string;
};

export function makeVolume(options: MakeVolumeOptions = {}) {
  const id = options.id ?? "vol_test_canonical";
  const identifiers = [];
  if (options.isbn10) identifiers.push({ type: "ISBN_10", identifier: options.isbn10 });
  if (options.isbn13) identifiers.push({ type: "ISBN_13", identifier: options.isbn13 });
  return {
    kind: "books#volume",
    id,
    etag: `"etag_${id}"`,
    selfLink: `https://www.googleapis.com/books/v1/volumes/${id}`,
    volumeInfo: {
      title: options.title ?? "Canonical Book Title",
      authors: options.authors ?? ["Canonical Author"],
      publisher: options.publisher ?? "Canonical Publisher",
      publishedDate: options.publishedDate ?? "2024-01-01",
      industryIdentifiers: identifiers,
      pageCount: options.pageCount ?? 320,
      imageLinks: {
        thumbnail:
          options.thumbnail ?? "https://books.google.com/books/content?id=canonical",
      },
      language: "ja",
    },
  };
}

/**
 * MSW handlers for `books.googleapis.com` / `www.googleapis.com/books/v1`
 * — either origin is valid per Google's routing. Match both so the test
 * works regardless of the `google-books.ts` helper's fetch URL.
 */
export function googleBooksHandlers(): HttpHandler[] {
  const volumesList = () =>
    HttpResponse.json({
      kind: "books#volumes",
      totalItems: 1,
      items: [makeVolume()],
    });

  const volumeGet = ({ params }: { params: Record<string, string> }) =>
    HttpResponse.json(makeVolume({ id: params.volumeId }));

  return [
    http.get("https://www.googleapis.com/books/v1/volumes", volumesList),
    http.get("https://www.googleapis.com/books/v1/volumes/:volumeId", volumeGet),
    http.get("https://books.googleapis.com/books/v1/volumes", volumesList),
    http.get("https://books.googleapis.com/books/v1/volumes/:volumeId", volumeGet),
  ];
}
