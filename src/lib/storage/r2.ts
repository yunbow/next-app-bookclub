import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

export const R2_ENABLED = Boolean(
  R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_ENDPOINT,
);

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (!R2_ENABLED) {
    throw new Error(
      "R2 is not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT.",
    );
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      // MinIO などローカル S3 互換ではパス形式 URL が必要
      forcePathStyle: true,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return cachedClient;
}

function buildPublicUrl(key: string): string {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return `${R2_ENDPOINT!.replace(/\/$/, "")}/${R2_BUCKET_NAME}/${key}`;
}

/** R2 公開 URL からオブジェクトキーを逆算する。URL が R2 由来でなければ null を返す。 */
export function extractKeyFromR2Url(url: string): string | null {
  const base = R2_PUBLIC_URL
    ? R2_PUBLIC_URL.replace(/\/$/, "")
    : R2_ENDPOINT && R2_BUCKET_NAME
      ? `${R2_ENDPOINT.replace(/\/$/, "")}/${R2_BUCKET_NAME}`
      : null;

  if (!base || !url.startsWith(base + "/")) return null;
  return url.slice(base.length + 1);
}

interface UploadParams {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}

export async function uploadToR2({
  key,
  body,
  contentType,
  cacheControl = "public, max-age=31536000, immutable",
}: UploadParams): Promise<string> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );
  return buildPublicUrl(key);
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
    }),
  );
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

interface UploadImageParams {
  userId: string;
  buffer: Buffer;
  mimeType: string;
}

export async function uploadReviewImage({
  userId,
  buffer,
  mimeType,
}: UploadImageParams): Promise<string> {
  const hash = createHash("sha1").update(buffer).digest("hex").slice(0, 12);
  const ext = MIME_TO_EXT[mimeType] ?? "bin";
  const key = `images/${userId}/${Date.now()}-${hash}.${ext}`;
  return uploadToR2({ key, body: buffer, contentType: mimeType });
}
