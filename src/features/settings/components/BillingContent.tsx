"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CreditCard, Check, ArrowRight, ExternalLink, Loader2 } from "lucide-react";
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

export function BillingContent({ subscription, success, canceled }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const currentPlan = (subscription?.plan ?? "free") as PlanType;

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
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold">サブスクリプション</h1>
          <p className="text-muted-foreground text-sm">
            現在のプラン:{" "}
            <span className="font-medium text-foreground">
              {PLAN_FEATURES[currentPlan].nameJa}
            </span>
            {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
              <span className="ml-2 text-destructive">
                （
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("ja-JP")}
                に終了予定）
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_ORDER.map((plan) => {
          const config = PLAN_FEATURES[plan];
          const isCurrent = plan === currentPlan;
          const isPremium = plan === "premium";
          const isUpgrade = PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(currentPlan);

          return (
            <Card
              key={plan}
              className={cn(
                isCurrent && "border-primary ring-1 ring-primary",
                isPremium && !isCurrent && "bg-primary/5"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{config.nameJa}</CardTitle>
                  {isCurrent && <Badge>現在のプラン</Badge>}
                  {isPremium && !isCurrent && (
                    <Badge variant="secondary">おすすめ</Badge>
                  )}
                </div>
                <CardDescription>{config.description}</CardDescription>
                <div className="text-2xl font-bold pt-1">
                  {config.price === 0
                    ? "無料"
                    : `¥${config.price.toLocaleString()}`}
                  {config.price > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /月
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  {config.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrent ? (
                  plan !== "free" ? (
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
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      現在のプラン
                    </Button>
                  )
                ) : plan === "free" ? (
                  subscription?.stripeCustomerId ? (
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
                      ダウングレード
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      無料プラン
                    </Button>
                  )
                ) : (
                  <Button
                    className="w-full"
                    variant={isUpgrade ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan)}
                    disabled={isLoading}
                  >
                    {loading === plan ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {loading === plan
                      ? "処理中..."
                      : isUpgrade
                        ? "アップグレード"
                        : "変更"}
                    {loading !== plan && isUpgrade && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {subscription && subscription.plan !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">サブスクリプション詳細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {subscription.currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">次回更新日</span>
                <span>
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    "ja-JP"
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">ステータス</span>
              <span className="capitalize">{subscription.status}</span>
            </div>
            {subscription.cancelAtPeriodEnd && (
              <p className="text-destructive text-xs">
                次回更新日にサブスクリプションが自動的に終了します。
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
