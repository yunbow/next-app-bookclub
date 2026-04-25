import { NextRequest, NextResponse } from 'next/server';
import { searchByISBN } from '@/lib/google-books';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isbn = searchParams.get('isbn');

  if (!isbn) {
    return NextResponse.json(
      { error: 'ISBN parameter is required' },
      { status: 400 }
    );
  }

  try {
    const bookInfo = await searchByISBN(isbn);

    if (!bookInfo) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: bookInfo });
  } catch (error) {
    console.error('Error in ISBN search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
