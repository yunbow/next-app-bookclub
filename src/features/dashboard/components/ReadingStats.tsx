"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReadingStatsProps {
  thisMonthBooks: number;
  thisYearBooks: number;
  totalReadingHours: number;
  averageReadingSpeed: number;
}

export function ReadingStats({
  thisMonthBooks,
  thisYearBooks,
  totalReadingHours,
  averageReadingSpeed,
}: ReadingStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            今月読んだ冊数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{thisMonthBooks}</div>
          <p className="text-xs text-muted-foreground mt-1">冊</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            今年読んだ冊数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{thisYearBooks}</div>
          <p className="text-xs text-muted-foreground mt-1">冊</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            総読書時間
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalReadingHours}</div>
          <p className="text-xs text-muted-foreground mt-1">時間</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            平均読書速度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{averageReadingSpeed}</div>
          <p className="text-xs text-muted-foreground mt-1">ページ/時間</p>
        </CardContent>
      </Card>
    </div>
  );
}
