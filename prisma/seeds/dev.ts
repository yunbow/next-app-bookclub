import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCommon } from "./common";

const DEV_PASSWORD = "password123";

const USERS = [
  {
    email: "alice@example.com",
    name: "Alice",
    username: "alice",
    bio: "本好きのデモユーザー Alice です。",
  },
  {
    email: "bob@example.com",
    name: "Bob",
    username: "bob",
    bio: "技術書を中心に読むデモユーザー Bob です。",
  },
] as const;

const BOOKS = [
  {
    isbn: "9784873115658",
    title: "リーダブルコード",
    author: "Dustin Boswell, Trevor Foucher",
    publisher: "オライリージャパン",
    publishedYear: 2012,
    category: "tech",
    description: "より良いコードを書くための実践的なテクニック集。",
    pages: 260,
  },
  {
    isbn: "9784062748254",
    title: "夜は短し歩けよ乙女",
    author: "森見登美彦",
    publisher: "角川書店",
    publishedYear: 2008,
    category: "novel",
    description: "京都を舞台にした青春ファンタジー小説。",
    pages: 392,
  },
  {
    isbn: "9784839956172",
    title: "プログラマの数学",
    author: "結城浩",
    publisher: "SBクリエイティブ",
    publishedYear: 2014,
    category: "tech",
    description: "プログラミングの土台となる数学的な考え方をやさしく解説。",
    pages: 336,
  },
  {
    isbn: "9784763135078",
    title: "コーヒーが冷めないうちに",
    author: "川口俊和",
    publisher: "サンマーク出版",
    publishedYear: 2015,
    category: "novel",
    description: "ある喫茶店を舞台にした、4つの心温まる物語。",
    pages: 296,
  },
] as const;

export async function seedDev(prisma: PrismaClient): Promise<void> {
  await seedCommon(prisma);

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  const users = await Promise.all(
    USERS.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          username: u.username,
          bio: u.bio,
          password: passwordHash,
          emailVerified: new Date(),
        },
        create: {
          email: u.email,
          name: u.name,
          username: u.username,
          bio: u.bio,
          password: passwordHash,
          emailVerified: new Date(),
        },
      })
    )
  );

  const books = await Promise.all(
    BOOKS.map((b) =>
      prisma.book.upsert({
        where: { isbn: b.isbn },
        update: {
          title: b.title,
          author: b.author,
          publisher: b.publisher,
          publishedYear: b.publishedYear,
          category: b.category,
          description: b.description,
          pages: b.pages,
        },
        create: { ...b },
      })
    )
  );

  const [alice, bob] = users;
  const [readableCode, yowamushi, mathForProgrammers, coffeeNotCold] = books;

  // 各ユーザーが3件ずつレビュー投稿
  const reviewSeeds = [
    {
      userId: alice.id,
      bookId: readableCode.id,
      content:
        "命名やコメントの考え方が変わる一冊でした。日々のコードレビューが楽しくなります。",
      rating: 5,
    },
    {
      userId: alice.id,
      bookId: mathForProgrammers.id,
      content:
        "数学が苦手でも読み進められる丁寧な構成。再帰や帰納法の章が特にお気に入りです。",
      rating: 4,
    },
    {
      userId: alice.id,
      bookId: coffeeNotCold.id,
      content:
        "短編それぞれに温かさがあり、読み終わると誰かに会いたくなる物語でした。",
      rating: 5,
    },
    {
      userId: bob.id,
      bookId: yowamushi.id,
      content:
        "森見ワールド全開の楽しい小説。読み終わった後に京都を歩きたくなりました。",
      rating: 4,
    },
    {
      userId: bob.id,
      bookId: readableCode.id,
      content:
        "何度読み返しても発見がある名著。チームで輪読すると会話が弾みます。",
      rating: 5,
    },
    {
      userId: bob.id,
      bookId: mathForProgrammers.id,
      content:
        "アルゴリズムを学ぶ前の良い導入書。図とコードのバランスが絶妙でした。",
      rating: 4,
    },
  ];

  const reviews = [];
  for (const r of reviewSeeds) {
    const existing = await prisma.review.findFirst({
      where: { userId: r.userId, bookId: r.bookId },
    });
    const review = existing
      ? await prisma.review.update({
          where: { id: existing.id },
          data: { content: r.content, rating: r.rating },
        })
      : await prisma.review.create({ data: r });
    reviews.push(review);
  }

  // 互いのレビューにコメント1件ずつ
  const commentSeeds = [
    {
      reviewId: reviews[0].id,
      userId: bob.id,
      content: "私も読みました！特に命名の章が刺さりました。",
    },
    {
      reviewId: reviews[3].id,
      userId: alice.id,
      content: "気になっていた本です。週末に読んでみます。",
    },
  ];

  for (const c of commentSeeds) {
    const existing = await prisma.reviewComment.findFirst({
      where: { reviewId: c.reviewId, userId: c.userId, content: c.content },
    });
    if (!existing) {
      await prisma.reviewComment.create({ data: c });
    }
  }

  // UserBook: alice は readableCode を完読、bob は yowamushi を読書中
  await prisma.userBook.upsert({
    where: { userId_bookId: { userId: alice.id, bookId: readableCode.id } },
    update: { status: "completed", rating: 5, currentPage: readableCode.pages ?? 0 },
    create: {
      userId: alice.id,
      bookId: readableCode.id,
      status: "completed",
      rating: 5,
      currentPage: readableCode.pages ?? 0,
    },
  });
  await prisma.userBook.upsert({
    where: { userId_bookId: { userId: bob.id, bookId: yowamushi.id } },
    update: { status: "reading", currentPage: 120 },
    create: {
      userId: bob.id,
      bookId: yowamushi.id,
      status: "reading",
      currentPage: 120,
    },
  });

  // alice は Premium プラン
  await prisma.subscription.upsert({
    where: { userId: alice.id },
    update: { plan: "premium", status: "active" },
    create: {
      userId: alice.id,
      plan: "premium",
      status: "active",
    },
  });
}
