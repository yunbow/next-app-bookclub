"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteHighlight } from "../queries/highlight-queries";
import { toast } from "sonner";

interface HighlightCardProps {
  highlight: {
    id: string;
    content: string;
    pageNumber?: number | null;
    chapter?: string | null;
    note?: string | null;
    color: string;
    isPublic: boolean;
    createdAt: Date;
  };
  showActions?: boolean;
}

const colorClasses: Record<string, string> = {
  yellow: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300",
  green: "bg-green-100 dark:bg-green-900/30 border-green-300",
  blue: "bg-blue-100 dark:bg-blue-900/30 border-blue-300",
  pink: "bg-pink-100 dark:bg-pink-900/30 border-pink-300",
};

export function HighlightCard({ highlight, showActions = true }: HighlightCardProps) {
  const deleteHighlight = useDeleteHighlight();

  const handleDelete = async () => {
    if (!confirm("このハイライトを削除しますか？")) return;

    try {
      await deleteHighlight.mutateAsync(highlight.id);
      toast.success("ハイライトを削除しました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  return (
    <Card className={`border-l-4 ${colorClasses[highlight.color] || colorClasses.yellow}`}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <blockquote className="text-sm italic flex-1">
              &ldquo;{highlight.content}&rdquo;
            </blockquote>
            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteHighlight.isPending}
              >
                削除
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {highlight.pageNumber && (
              <span>📄 p.{highlight.pageNumber}</span>
            )}
            {highlight.chapter && (
              <span>📖 {highlight.chapter}</span>
            )}
            {highlight.isPublic && (
              <Badge variant="outline" className="text-xs">
                公開
              </Badge>
            )}
          </div>

          {highlight.note && (
            <div className="bg-muted p-2 rounded text-sm">
              <p className="text-muted-foreground text-xs mb-1">メモ:</p>
              <p>{highlight.note}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
