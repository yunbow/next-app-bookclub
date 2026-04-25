"use client";

import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Smartphone, Monitor } from "lucide-react";

interface LoginHistory {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

interface LoginHistoryListProps {
  loginHistories: LoginHistory[];
}

function getDeviceIcon(userAgent: string | null) {
  if (!userAgent) return <Globe className="h-4 w-4" />;
  
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return <Smartphone className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
}

function getDeviceName(userAgent: string | null) {
  if (!userAgent) return "不明なデバイス";
  
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari")) return "Safari";
  if (ua.includes("edge")) return "Edge";
  if (ua.includes("mobile") || ua.includes("android")) return "モバイル";
  if (ua.includes("iphone")) return "iPhone";
  return "その他のブラウザ";
}

export function LoginHistoryList({ loginHistories }: LoginHistoryListProps) {
  if (loginHistories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ログイン履歴</CardTitle>
          <CardDescription>
            最近のログイン履歴を表示します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            ログイン履歴がありません
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ログイン履歴</CardTitle>
        <CardDescription>
          最近のログイン履歴を表示します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loginHistories.map((history) => (
            <div
              key={history.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="text-muted-foreground mt-1">
                {getDeviceIcon(history.userAgent)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {getDeviceName(history.userAgent)}
                  </span>
                </div>
                {history.ipAddress && (
                  <p className="text-xs text-muted-foreground mb-1">
                    IP: {history.ipAddress}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(history.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
