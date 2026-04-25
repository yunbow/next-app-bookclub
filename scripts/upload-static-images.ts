import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readdir, readFile } from "node:fs/promises";
import { join, extname, relative } from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PUBLIC_DIR = join(process.cwd(), "public");

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

function createClient(): S3Client {
  const { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT } = process.env;
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
    throw new Error(
      "Required env vars are not set: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT",
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

async function collectImageFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectImageFiles(fullPath)));
    } else if (CONTENT_TYPES[extname(entry.name).toLowerCase()]) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const { R2_BUCKET_NAME, R2_PUBLIC_URL, R2_ENDPOINT } = process.env;
  if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not set");

  const client = createClient();
  const files = await collectImageFiles(PUBLIC_DIR);

  if (files.length === 0) {
    console.log("No images found in public/");
    return;
  }

  console.log(`Uploading ${files.length} file(s) to R2 bucket "${R2_BUCKET_NAME}"...\n`);

  const baseUrl =
    R2_PUBLIC_URL?.replace(/\/$/, "") ??
    `${R2_ENDPOINT!.replace(/\/$/, "")}/${R2_BUCKET_NAME}`;

  for (const filePath of files) {
    const key = relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
    const contentType = CONTENT_TYPES[extname(filePath).toLowerCase()];
    const body = await readFile(filePath);

    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    console.log(`✓ ${key}`);
    console.log(`  ${baseUrl}/${key}\n`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
