"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/lib/i18n";
import { FontSizeProvider } from "@/lib/font-size";
import { ColorVisionProvider } from "@/lib/color-vision";
import { ReactQueryProvider } from "@/lib/react-query/provider";

type ProvidersProps = {
  children: React.ReactNode;
  nonce?: string;
};

export function Providers({ children, nonce }: ProvidersProps) {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme" nonce={nonce}>
          <FontSizeProvider>
            <ColorVisionProvider>
              <LocaleProvider>
                {children}
                <Toaster />
              </LocaleProvider>
            </ColorVisionProvider>
          </FontSizeProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </SessionProvider>
  );
}
