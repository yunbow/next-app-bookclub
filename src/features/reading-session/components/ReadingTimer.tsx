"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveSession, useStartSession, useEndSession } from "../queries/session-queries";
import { toast } from "sonner";

interface ReadingTimerProps {
  bookId: string;
  onSessionEnd?: () => void;
}

export function ReadingTimer({ bookId, onSessionEnd }: ReadingTimerProps) {
  const { data: activeSession } = useActiveSession();
  const startSession = useStartSession();
  const endSession = useEndSession();
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pagesRead, setPagesRead] = useState(0);

  useEffect(() => {
    if (activeSession && activeSession.bookId === bookId) {
      const interval = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - new Date(activeSession.startTime).getTime()) / 1000
        );
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedTime(0);
    }
  }, [activeSession, bookId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    try {
      await startSession.mutateAsync({ bookId });
      toast.success("読書を開始しました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const handleEnd = async () => {
    if (!activeSession) return;

    try {
      const result = await endSession.mutateAsync({
        sessionId: activeSession.id,
        pagesRead: pagesRead > 0 ? pagesRead : undefined,
      });
      
      const minutes = Math.floor(result.duration / 60);
      toast.success(`読書を終了しました（${minutes}分）`);
      setPagesRead(0);
      onSessionEnd?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const isActive = activeSession && activeSession.bookId === bookId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>読書タイマー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-mono font-bold mb-4">
            {formatTime(elapsedTime)}
          </div>
          
          {!isActive ? (
            <Button
              onClick={handleStart}
              disabled={startSession.isPending || !!activeSession}
              className="w-full"
              size="lg"
            >
              {activeSession ? "他の本を読書中" : "読書を開始"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pagesRead">読んだページ数（任意）</Label>
                <Input
                  id="pagesRead"
                  type="number"
                  value={pagesRead}
                  onChange={(e) => setPagesRead(parseInt(e.target.value) || 0)}
                  min={0}
                  placeholder="0"
                />
              </div>
              <Button
                onClick={handleEnd}
                disabled={endSession.isPending}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                {endSession.isPending ? "終了中..." : "読書を終了"}
              </Button>
            </div>
          )}
        </div>

        {isActive && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              📖 読書中...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
