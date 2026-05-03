import type { PrismaClient } from "@prisma/client";

const GENRES: Array<{ name: string; slug: string }> = [
  { name: "小説", slug: "novel" },
  { name: "ビジネス", slug: "business" },
  { name: "技術書", slug: "tech" },
  { name: "エッセイ", slug: "essay" },
  { name: "歴史", slug: "history" },
  { name: "自己啓発", slug: "self-help" },
  { name: "漫画", slug: "manga" },
  { name: "詩集", slug: "poetry" },
  { name: "学術", slug: "academic" },
  { name: "ノンフィクション", slug: "non-fiction" },
];

export async function seedCommon(prisma: PrismaClient): Promise<void> {
  // name / slug がともに @unique のため、過去の別シード（migrate-favorite-genres など）が
  // 同じ name を異なる slug で登録しているケースに備え、どちらかで一致する行を更新する。
  for (const genre of GENRES) {
    const existing = await prisma.genre.findFirst({
      where: { OR: [{ slug: genre.slug }, { name: genre.name }] },
    });
    if (existing) {
      await prisma.genre.update({
        where: { id: existing.id },
        data: { name: genre.name, slug: genre.slug },
      });
    } else {
      await prisma.genre.create({ data: genre });
    }
  }
}
