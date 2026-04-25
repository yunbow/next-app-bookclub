"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { registerSchema, RegisterInput } from "../schema/auth-schema";
import { registerAction } from "../server/auth-actions";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n";
import { FormError } from "@/components/common/FormError";

export function RegisterForm() {
  const { t } = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await registerAction(formData);

    if (result.success) {
      toast.success("登録が完了しました。ログインしてください。");
      router.push("/login");
    } else {
      setError(result.error?.message || t("registration.failed"));
    }

    setIsLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={error || undefined} className="text-center" />

        <div className="space-y-2">
          <Label htmlFor="name">
            ユーザー名
            <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="表示名を入力してください"
            aria-describedby={errors.name ? "register-name-error" : undefined}
            aria-required="true"
            {...register("name")}
          />
          <FormError message={errors.name?.message} id="register-name-error" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            {t("login.email")}
            <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t("login.emailPlaceholder")}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            aria-required="true"
            {...register("email")}
          />
          <FormError message={errors.email?.message} id="register-email-error" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            パスワード
            <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            aria-describedby={errors.password ? "register-password-error" : undefined}
            aria-required="true"
            {...register("password")}
          />
          <FormError message={errors.password?.message} id="register-password-error" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            パスワード（確認）
            <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="********"
            aria-describedby={errors.confirmPassword ? "register-confirm-password-error" : undefined}
            aria-required="true"
            {...register("confirmPassword")}
          />
          <FormError message={errors.confirmPassword?.message} id="register-confirm-password-error" />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "登録中..." : "登録"}
        </Button>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          {t("registration.termsAgreePrefix")}
          <Link href="/terms" className="text-primary hover:underline">{t("registration.termsLink")}</Link>
          {t("registration.termsConnector")}
          <Link href="/privacy" className="text-primary hover:underline">{t("registration.privacyLink")}</Link>
          {t("registration.termsIncludingCookie", { cookie: "" }).split("{cookie}")[0]}
          <Link href="/cookies" className="text-primary hover:underline">{t("registration.cookieLink")}</Link>
          {t("registration.termsIncludingCookie", { cookie: "" }).split("{cookie}")[1]}
          {t("registration.termsAgreeSuffix")}
        </p>
      </form>
    </>
  );
}
