import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  R2_ENABLED,
  uploadReviewImage,
  extractKeyFromR2Url,
  deleteFromR2,
} from '@/lib/storage/r2';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'images');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (R2_ENABLED) {
      const url = await uploadReviewImage({
        userId: session.user.id,
        buffer,
        mimeType: file.type,
      });
      return NextResponse.json({ url, size: file.size, mimeType: file.type });
    }

    // ローカル FS フォールバック (R2 未設定時)
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${session.user.id}_${timestamp}_${randomString}.${extension}`;
    await writeFile(join(UPLOAD_DIR, filename), buffer);

    return NextResponse.json({
      url: `/uploads/images/${filename}`,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    if (R2_ENABLED) {
      const key = extractKeyFromR2Url(url);
      if (!key) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
      }
      // キーが自分のファイルであることを確認
      if (!key.startsWith(`images/${session.user.id}/`)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      await deleteFromR2(key);
      return NextResponse.json({ success: true });
    }

    // ローカル FS フォールバック
    const filename = url.split('/').pop();

    if (!filename) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!filename.startsWith(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const filepath = join(UPLOAD_DIR, filename);
    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
