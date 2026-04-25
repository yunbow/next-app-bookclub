"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateUserBook } from "../queries/book-queries";
import { toast } from "sonner";

interface ReadingStatusButtonProps {
  bookId: string;
  currentStatus?: string;
}

const statusOptions = [
  { value: "to_read", label: "積読" },
  { value: "reading", label: "読書中" },
  { value: "completed", label: "読了" },
  { value: "paused", label: "一時中断" },
];

export function ReadingStatusButton({ bookId, currentStatus }: ReadingStatusButtonProps) {
  const updateUserBook = useUpdateUserBook();
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (status: string) => {
    try {
      await updateUserBook.mutateAsync({
        bookId,
        data: {
          status: status as "to_read" | "reading" | "completed" | "paused",
          startDate: status === "reading" ? new Date().toISOString() : undefined,
          endDate: status === "completed" ? new Date().toISOString() : undefined,
        },
      });
      toast.success("読書ステータスを更新しました");
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const currentLabel = statusOptions.find((opt) => opt.value === currentStatus)?.label || "ステータスを設定";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={currentStatus ? "default" : "outline"}>
          {currentLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
