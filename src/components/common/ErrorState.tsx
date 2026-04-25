import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "エラーが発生しました",
  description = "問題が発生しました。もう一度お試しください。",
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          再試行
        </Button>
      )}
    </div>
  );
}
