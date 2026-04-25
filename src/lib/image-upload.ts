/**
 * Image upload utilities
 */

export interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Upload image to server
 * In production, this should upload to a cloud storage service (S3, Cloudinary, etc.)
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('サポートされていない画像形式です');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('画像サイズは5MB以下にしてください');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '画像のアップロードに失敗しました');
  }

  return await response.json();
}

/**
 * Upload multiple images
 */
export async function uploadImages(files: File[]): Promise<UploadedImage[]> {
  const uploads = files.map((file) => uploadImage(file));
  return await Promise.all(uploads);
}

/**
 * Delete image from server
 */
export async function deleteImage(url: string): Promise<void> {
  const response = await fetch('/api/upload/image', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '画像の削除に失敗しました');
  }
}

/**
 * Compress image before upload
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let valid = true;

        if (minWidth && img.width < minWidth) valid = false;
        if (minHeight && img.height < minHeight) valid = false;
        if (maxWidth && img.width > maxWidth) valid = false;
        if (maxHeight && img.height > maxHeight) valid = false;

        resolve(valid);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
