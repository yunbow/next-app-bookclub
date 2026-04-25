import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { ReadingStats } from "@/features/dashboard/components/ReadingStats";
import { ReadingProgress } from "@/features/dashboard/components/ReadingProgress";
import { ReadingGoalsComponent } from "@/features/dashboard/components/ReadingGoalsComponent";
import { RankingsBadges } from "@/features/dashboard/components/RankingsBadges";
import { Recommendations } from "@/features/dashboard/components/Recommendations";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      level: true,
    },
  });

  // Fetch reading stats
  const thisMonthBooks = await prisma.userBook.count({
    where: {
      userId,
      status: "completed",
      endDate: {
        gte: new Date(currentYear, currentMonth - 1, 1),
        lt: new Date(currentYear, currentMonth, 1),
      },
    },
  });

  const thisYearBooks = await prisma.userBook.count({
    where: {
      userId,
      status: "completed",
      endDate: {
        gte: new Date(currentYear, 0, 1),
      },
    },
  });

  // Calculate total reading hours from reading sessions
  const readingSessions = await prisma.readingSession.findMany({
    where: {
      userId,
    },
    select: {
      duration: true,
    },
  });

  const totalReadingSeconds = readingSessions.reduce(
    (sum, session) => sum + session.duration,
    0
  );
  const totalReadingHours = Math.round(totalReadingSeconds / 3600);

  // Calculate average reading speed (pages per hour)
  const averageReadingSpeed =
    totalReadingSeconds > 0
      ? Math.round(
          (readingSessions.reduce((sum, s) => sum + (s.duration || 0), 0) /
            totalReadingSeconds) *
            100
        )
      : 0;

  // Fetch currently reading books
  const readingBooks = await prisma.book.findMany({
    where: {
      userBooks: {
        some: {
          userId,
          status: "reading",
        },
      },
    },
    include: {
      userBooks: {
        where: { userId, status: "reading" },
        select: {
          currentPage: true,
          status: true,
        },
      },
    },
    take: 5,
  });

  // Fetch reading goals
  const readingGoals = await prisma.readingGoal.findMany({
    where: { userId },
  });

  // Fetch user badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: {
        select: {
          id: true,
          code: true,
          name: true,
          icon: true,
          rarity: true,
        },
      },
    },
    take: 10,
  });

  // Fetch recommended books (most reviewed books)
  const recommendedBooks = await prisma.book.findMany({
    include: {
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      reviews: {
        _count: "desc",
      },
    },
    take: 6,
  });

  // Fetch recent activities
  const activities = await prisma.activity.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">ホーム</h1>

      <div className="space-y-8">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              ようこそ、{session.user.name || session.user.email}さん
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              BookClubへようこそ！読書記録を始めましょう。
            </p>
          </CardContent>
        </Card>

        {/* Reading Stats */}
        <ReadingStats
          thisMonthBooks={thisMonthBooks}
          thisYearBooks={thisYearBooks}
          totalReadingHours={totalReadingHours}
          averageReadingSpeed={averageReadingSpeed}
        />

        {/* Reading Progress */}
        <ReadingProgress books={readingBooks} />

        {/* Reading Goals and Rankings/Badges */}
        <div className="grid gap-4 md:grid-cols-2">
          <ReadingGoalsComponent goals={readingGoals} />
          <RankingsBadges
            level={user?.level || 1}
            xp={user?.xp || 0}
            badges={userBadges.map((ub) => ub.badge)}
          />
        </div>

        {/* Recommendations */}
        <Recommendations books={recommendedBooks} />

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>最近の活動</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={activities} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
