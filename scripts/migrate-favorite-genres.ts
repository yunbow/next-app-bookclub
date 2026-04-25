import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// 固定シード: よく使われるジャンル
const SEED_GENRES = [
  "小説",
  "文芸",
  "ミステリー",
  "SF",
  "ファンタジー",
  "ホラー",
  "ライトノベル",
  "ビジネス",
  "自己啓発",
  "経済",
  "心理学",
  "哲学",
  "歴史",
  "科学",
  "コンピュータ",
  "アート",
  "エッセイ",
  "詩",
  "児童書",
  "漫画",
  "絵本",
  "料理",
  "旅行",
  "健康",
  "スポーツ",
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g, "");
}

function genId() {
  return "c" + randomUUID().replace(/-/g, "").slice(0, 24);
}

async function ensureGenre(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM genres WHERE name = ${trimmed} LIMIT 1
  `;
  if (existing.length > 0) return existing[0].id;

  const slug = toSlug(trimmed) || trimmed;
  const id = genId();
  await prisma.$executeRaw`
    INSERT INTO genres (id, name, slug, createdAt)
    VALUES (${id}, ${trimmed}, ${slug}, CURRENT_TIMESTAMP)
  `;
  return id;
}

async function linkUserGenre(userId: string, genreId: string) {
  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM user_favorite_genres WHERE userId = ${userId} AND genreId = ${genreId} LIMIT 1
  `;
  if (existing.length > 0) return false;

  await prisma.$executeRaw`
    INSERT INTO user_favorite_genres (id, userId, genreId, createdAt)
    VALUES (${genId()}, ${userId}, ${genreId}, CURRENT_TIMESTAMP)
  `;
  return true;
}

async function main() {
  console.log("Seeding master genres...");
  for (const name of SEED_GENRES) {
    await ensureGenre(name);
  }

  console.log("Migrating existing User.favoriteGenres (comma strings)...");
  const users = await prisma.$queryRaw<Array<{ id: string; favoriteGenres: string | null }>>`
    SELECT id, favoriteGenres FROM users WHERE favoriteGenres IS NOT NULL AND favoriteGenres != ''
  `;

  let migratedUsers = 0;
  let linkedRows = 0;

  for (const user of users) {
    if (!user.favoriteGenres) continue;

    const names = user.favoriteGenres
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (names.length === 0) continue;

    for (const name of names) {
      const genreId = await ensureGenre(name);
      if (!genreId) continue;
      const created = await linkUserGenre(user.id, genreId);
      if (created) linkedRows++;
    }
    migratedUsers++;
  }

  console.log(`Done. Migrated ${migratedUsers} users, created ${linkedRows} favorite genre rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
