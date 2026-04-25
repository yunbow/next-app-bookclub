"use client";

// Canonical root error.tsx — segment error boundary.
// MUST be a Client Component because Next.js passes the `reset` callback
// only to client boundaries. Keep the file self-contained (no project UI kit
// imports) so that a broken component library never takes this route down
// with it — this file must render even when the rest of the app is red.
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfacing to the server logger would be ideal but the runtime here is
    // the client; leave that to a Sentry/OTel integration and keep the local
    // signal visible in devtools.
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="container mx-auto max-w-2xl py-12 flex flex-col items-center gap-4 text-center"
    >
      <h2 className="text-2xl font-semibold">エラーが発生しました</h2>
      <p className="text-muted-foreground">
        ページの読み込み中に問題が発生しました。もう一度お試しください。
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
      >
        再試行
      </button>
    </div>
  );
}
