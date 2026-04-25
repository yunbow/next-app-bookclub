"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const MDPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

type Props = {
  content: string;
  className?: string;
};

export function MarkdownPreview({ content, className = "" }: Props) {
  const { theme } = useTheme();

  return (
    <div className={className}>
      <MDPreview
        source={content}
        style={{
          backgroundColor: "transparent",
          color: "inherit",
        }}
        data-color-mode={theme === "dark" ? "dark" : "light"}
      />
    </div>
  );
}
