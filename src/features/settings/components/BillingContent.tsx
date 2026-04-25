"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  Check,
  ArrowRight,
  ExternalLink,
  Loader2,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLAN_FEATURES, type PlanType } from "@/lib/plans";
import type { Subscription } from "@prisma/client";

interface Props {
  subscription: Subscription | null;
  success: boolean;
  canceled: boolean;
}

const PLAN_ORDER: PlanType[] = ["free", "basic", "premium"];

type CellValue = boolean | string;

interface FeatureRow {
  label: string;
  free: CellValue;
  basic: CellValue;
  premium: CellValue;
}

const FEATURE_ROWS: FeatureRow[] = [
  { label: "読書記録・管理",           free: true,      basic: true,      premium: true },
  { label: "クラブ・グループ参加",      free: "3件まで", basic: "無制限",  premium: "無制限" },
  { label: "レビュー投稿（公開）",      free: true,      basic: true,      premium: true },
  { label: "レビュー下書き保存",        free: false,     basic: true,      premium: true },
  { label: "レビュー予約投稿",          free: false,     basic: false,     premium: true },
  { label: "ハイライト・引用",          free: "10件まで",basic: "50件まで",premium: "無制限" },
  { label: "グループ作成",             free: false,     basic: true,      premium: true },
  { label: "データエクスポート",        free: false,     basic: false,     premium: true },
  { label: "限定バッジ",               free: false,     basic: false,     premium: true },
  { label: "優先サポート",             free: false,     basic: false,     premium: true },
];

const PLAN_BADGE_VARIANT: Record<PlanType, "default" | "secondary" | "outline"> = {
  free: "outline",
  basic: "secondary",
  premium: "default",
};

function FeatureCell({ value, isCurrentPlan }: { value: CellValue; isCurrentPlan: boolean }) {
  const highlight = isCurrentPlan ? "font-medium" : "text-muted-foreground";
  if (value === true) {
    return <Check className={cn("mx-auto h-4 w-4", isCurrentPlan ? "text-primary" : "text-green-500")} />;
  }
  if (value === false) {
    return <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />;
  }
  return <span className={cn("text-xs", highlight)}>{value}</span>;
}

export function BillingContent({ subscription, success, canceled }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const currentPlan = (subscription?.plan ?? "free") as PlanType;
  const currentConfig = PLAN_FEATURES[currentPlan];

  useEffect(() => {
    if (success) toast.success("プランを更新しました");
    if (canceled) toast.info("プランの変更をキャンセルしました");
  }, [success, canceled]);

  const handleUpgrade = async (plan: PlanType) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("エラーが発生しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("エラーが発生しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(null);
    }
  };

  const isLoading = loading !== null;

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CreditCard className="h-8 w-8" />
        <h1 className="text-2xl font-bold">サブスクリプション</h1>
      </div>

      {/* Current plan status */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">現在のプラン</p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">{currentConfig.nameJa}</h2>
                <Badge variant={PLAN_BADGE_VARIANT[currentPlan]}>
                  {currentPlan === "free" ? "無料" : `¥${currentConfig.price.toLocaleString()}/月`}
                </Badge>
              </div>
              {subscription?.currentPeriodEnd && currentPlan !== "free" && (
                <p className="text-sm text-muted-foreground">
                  次回更新日:{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {subscription.cancelAtPeriodEnd && (
                    <span className="ml-2 text-destructive font-medium">（解約予定）</span>
                  )}
                </p>
              )}
            </div>
            {currentPlan !== "free" && (
              <Button
                variant="outline"
                onClick={handlePortal}
                disabled={isLoading}
                className="shrink-0"
              >
                {loading === "portal" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                プランを管理
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">プランを選択</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_ORDER.map((plan) => {
            const config = PLAN_FEATURES[plan];
            const isCurrent = plan === currentPlan;
            const currentIdx = PLAN_ORDER.indexOf(currentPlan);
            const planIdx = PLAN_ORDER.indexOf(plan);
            const isUpgrade = planIdx > currentIdx;
            const isDowngrade = planIdx < currentIdx;

            return (
              <Card
                key={plan}
                className={cn(
                  "relative flex flex-col",
                  isCurrent && "border-primary ring-1 ring-primary",
                  plan === "premium" && !isCurrent && "border-primary/40"
                )}
              >
                {plan === "premium" && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="text-xs px-3">おすすめ</Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{config.nameJa}</CardTitle>
                    {isCurrent && <Badge variant="outline" className="text-xs">現在</Badge>}
                  </div>
                  <CardDescription className="text-xs">{config.description}</CardDescription>
                  <div className="pt-1">
                    <span className="text-2xl font-bold">
                      {config.price === 0 ? "無料" : `¥${config.price.toLocaleString()}`}
                    </span>
                    {config.price > 0 && (
                      <span className="text-sm text-muted-foreground">/月</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {config.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {isCurrent ? (
                    plan === "free" ? (
                      <Button variant="outline" className="w-full" disabled>
                        現在のプラン
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handlePortal}
                        disabled={isLoading}
                      >
                        {loading === "portal" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ExternalLink className="mr-2 h-4 w-4" />
                        )}
                        プランを管理
                      </Button>
                    )
                  ) : isUpgrade ? (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan)}
                      disabled={isLoading}
                    >
                      {loading === plan ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {loading === plan ? "処理中..." : (
                        <>
                          アップグレード
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : isDowngrade && subscription?.stripeCustomerId ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handlePortal}
                      disabled={isLoading}
                    >
                      {loading === "portal" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      ダウングレード
                    </Button>
                  ) : (
                    <Button variant="ghost" className="w-full" disabled>
                      {config.price === 0 ? "無料プラン" : "利用不可"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feature comparison table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">機能比較</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium w-1/2">機能</th>
                    {PLAN_ORDER.map((plan) => (
                      <th
                        key={plan}
                        className={cn(
                          "text-center px-4 py-3 font-medium w-[calc(50%/3)]",
                          plan === currentPlan && "text-primary"
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{PLAN_FEATURES[plan].nameJa}</span>
                          {plan === currentPlan && (
                            <Badge variant="outline" className="text-xs font-normal">現在</Badge>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row, i) => (
                    <tr
                      key={row.label}
                      className={cn(
                        "border-b last:border-0",
                        i % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      <td className="px-4 py-3 text-muted-foreground">{row.label}</td>
                      {PLAN_ORDER.map((plan) => (
                        <td key={plan} className="px-4 py-3 text-center">
                          <FeatureCell
                            value={row[plan]}
                            isCurrentPlan={plan === currentPlan}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-semibold mb-4">よくある質問</h2>
        <div className="space-y-3">
          {[
            {
              q: "いつでも解約できますか？",
              a: "はい。「プランを管理」から解約できます。解約後も現在の請求期間の終了まで利用できます。",
            },
            {
              q: "プランの変更はすぐに反映されますか？",
              a: "アップグレードは即時反映されます。ダウングレードは現在の請求期間終了後に適用されます。",
            },
            {
              q: "支払い方法はどうなりますか？",
              a: "クレジットカードによる決済です。「プランを管理」からカード情報の変更や請求履歴の確認ができます。",
            },
          ].map(({ q, a }) => (
            <Card key={q}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
