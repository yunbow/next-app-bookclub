import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventList } from "@/features/event/components/EventList";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/common/Pagination";
import { Prisma } from "@prisma/client";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ upcoming?: string; page?: string }>;
};

const ITEMS_PER_PAGE = 20;

export default async function EventsPage({ searchParams }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const upcomingOnly = params.upcoming === "true";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const where: Prisma.EventWhereInput = upcomingOnly ? { date: { gte: new Date() } } : {};

  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { date: "asc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.event.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container max-w-6xl pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">読書会</h1>
          <p className="text-muted-foreground mt-1">{totalCount}件のイベント</p>
        </div>
        <Link href="/clubs/new">
          <Button>読書会を作成</Button>
        </Link>
      </div>

      <div className="mb-6">
        <Link href={upcomingOnly ? "/clubs" : "/clubs?upcoming=true"}>
          <Button variant="outline">
            {upcomingOnly ? "すべて表示" : "開催予定のみ"}
          </Button>
        </Link>
      </div>

      <EventList events={events} />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/clubs"
        searchParams={{ ...(upcomingOnly && { upcoming: "true" }) }}
      />
    </div>
  );
}
