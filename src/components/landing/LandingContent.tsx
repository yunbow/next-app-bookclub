"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  MessageSquareText,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export function LandingContent() {
  const { t } = useTranslations();

  const stats = [
    t("landing.stats.library"),
    t("landing.stats.tracking"),
    t("landing.stats.community"),
  ];

  const features = [
    {
      icon: BookOpen,
      title: t("landing.features.management.title"),
      description: t("landing.features.management.description"),
    },
    {
      icon: TrendingUp,
      title: t("landing.features.tracking.title"),
      description: t("landing.features.tracking.description"),
    },
    {
      icon: MessageSquareText,
      title: t("landing.features.review.title"),
      description: t("landing.features.review.description"),
    },
    {
      icon: CalendarDays,
      title: t("landing.features.club.title"),
      description: t("landing.features.club.description"),
    },
  ];

  const workflow = [
    {
      icon: BookOpen,
      title: t("landing.workflow.registerTitle"),
      description: t("landing.workflow.registerDescription"),
    },
    {
      icon: Target,
      title: t("landing.workflow.trackTitle"),
      description: t("landing.workflow.trackDescription"),
    },
    {
      icon: Users,
      title: t("landing.workflow.connectTitle"),
      description: t("landing.workflow.connectDescription"),
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative isolate min-h-[calc(100svh-10rem)] overflow-hidden px-4 py-16 md:px-8 md:py-24">
        <Image
          src="/brand/landing-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/25" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="mx-auto flex min-h-[calc(100svh-18rem)] w-full max-w-7xl items-center">
          <div className="max-w-2xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{t("landing.hero.kicker")}</span>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-bold leading-[1.05] md:text-6xl">
                {t("landing.hero.title")}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
                {t("landing.hero.subtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full gap-2 text-base sm:w-auto">
                  {t("landing.hero.cta")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full bg-background/70 text-base backdrop-blur sm:w-auto">
                  {t("landing.hero.secondaryCta")}
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-3 pt-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap">
              {stats.map((stat) => (
                <span key={stat} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  {stat}
                </span>
              ))}
            </div>
            <p className="text-sm font-medium text-foreground/80">
              {t("landing.hero.trust")}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3 md:max-w-2xl">
            <p className="text-sm font-semibold text-primary">BookClub</p>
            <h2 className="text-3xl font-bold md:text-4xl">
              {t("landing.features.title")}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="rounded-lg shadow-sm transition-colors hover:border-primary/40">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10" aria-hidden="true">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="leading-6 tracking-normal">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary">Reading flow</p>
            <h2 className="text-3xl font-bold md:text-4xl">
              {t("landing.workflow.title")}
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              {t("landing.workflow.subtitle")}
            </p>
          </div>

          <div className="grid gap-4">
            {workflow.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="grid gap-4 rounded-lg border bg-card p-5 shadow-sm sm:grid-cols-[auto_1fr]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        0{index + 1}
                      </span>
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10" aria-hidden="true">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold md:text-4xl">
              {t("landing.finalCta.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
              {t("landing.finalCta.subtitle")}
            </p>
          </div>
          <Link href="/register">
            <Button size="lg" className="gap-2 text-base">
              {t("landing.hero.cta")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
