import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventList } from "@/features/event/components/EventList";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ upcoming?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const upcomingOnly = params.upcoming === "true";

  const where: any = {};
  if (upcomingOnly) {
    where.date = {
      gte: new Date(),
    };
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      _count: {
        select: {
          participants: true,
        },
      },
    },
    orderBy: { date: "asc" },
    take: 50,
  });

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">読書会</h1>
          <p className="text-muted-foreground mt-1">{events.length}件のイベント</p>
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
    </div>
  );
}
