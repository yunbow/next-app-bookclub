/**
 * 画像のパスをAPI経由のURLに変換する
 * @param imagePath - 画像のパス（例: "/uploads/profile/image.jpg" または "uploads/profile/image.jpg"）
 * @returns API経由のURL（例: "/api/images/profile/image.jpg"）
 */
export function getImageUrl(imagePath: string | null | undefined): string | undefined {
  if (!imagePath) return undefined;

  // すでにAPI URLの場合はそのまま返す
  if (imagePath.startsWith("/api/images/")) {
    return imagePath;
  }

  // 外部URLの場合はそのまま返す
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // /uploads/ で始まる場合は /api/images/ に変換
  if (imagePath.startsWith("/uploads/")) {
    return imagePath.replace("/uploads/", "/api/images/");
  }

  // uploads/ で始まる場合は /api/images/ に変換
  if (imagePath.startsWith("uploads/")) {
    return `/api/images/${imagePath.replace("uploads/", "")}`;
  }

  // その他の場合はそのまま返す
  return imagePath;
}
