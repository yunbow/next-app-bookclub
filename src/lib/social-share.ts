/**
 * Social media sharing utilities
 */

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Generate Twitter/X share URL
 */
export function getTwitterShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    text: `${data.title}\n${data.text}`,
    url: data.url,
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generate Facebook share URL
 */
export function getFacebookShareUrl(url: string): string {
  const params = new URLSearchParams({
    u: url,
  });

  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

/**
 * Generate review share data
 */
export function getReviewShareData(
  bookTitle: string,
  rating: number | null,
  reviewUrl: string
): ShareData {
  const ratingText = rating ? `⭐️ ${rating}/5` : '';
  return {
    title: `${bookTitle}のレビュー`,
    text: `「${bookTitle}」を読みました！${ratingText}`,
    url: reviewUrl,
  };
}

/**
 * Generate reading completion share data
 */
export function getReadingCompletionShareData(
  bookTitle: string,
  author: string | null,
  profileUrl: string
): ShareData {
  const authorText = author ? ` by ${author}` : '';
  return {
    title: '読書完了',
    text: `「${bookTitle}」${authorText}を読み終えました！`,
    url: profileUrl,
  };
}

/**
 * Generate event share data
 */
export function getEventShareData(
  eventTitle: string,
  eventDate: Date,
  eventUrl: string
): ShareData {
  const dateStr = eventDate.toLocaleDateString('ja-JP');
  return {
    title: eventTitle,
    text: `読書会「${eventTitle}」に参加します！（${dateStr}）`,
    url: eventUrl,
  };
}

/**
 * Check if Web Share API is available
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Share using Web Share API
 */
export async function shareViaWebShare(data: ShareData): Promise<boolean> {
  if (!isWebShareSupported()) {
    return false;
  }

  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
    });
    return true;
  } catch (error) {
    // User cancelled or error occurred
    console.error('Web Share API error:', error);
    return false;
  }
}
