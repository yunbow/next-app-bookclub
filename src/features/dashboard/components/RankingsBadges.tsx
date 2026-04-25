"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Badge {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  rarity: string;
}

interface RankingsBadgesProps {
  level: number;
  xp: number;
  badges: Badge[];
}

const rarityColors: Record<string, string> = {
  common: "bg-gray-100 text-gray-800",
  rare: "bg-blue-100 text-blue-800",
  epic: "bg-purple-100 text-purple-800",
  legendary: "bg-yellow-100 text-yellow-800",
};

export function RankingsBadges({ level, xp, badges }: RankingsBadgesProps) {
  const xpForNextLevel = level * 1000;
  const xpProgress = Math.round((xp % 1000) / 10);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">レベル</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-3xl font-bold">{level}</p>
                <p className="text-xs text-muted-foreground">
                  {xp % 1000}/{1000} XP
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              総XP: {xp.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">バッジ</CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    rarityColors[badge.rarity] || rarityColors.common
                  }`}
                  title={badge.name}
                >
                  {badge.icon && <span className="mr-1">{badge.icon}</span>}
                  {badge.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              バッジはまだ獲得していません
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
