// components/ui/pagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemLabel,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const labelPlural = totalItems !== 1 ? `${itemLabel}s` : itemLabel;

  return (
    <div className="border-t border-border p-4">
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="size-8 sm:size-9"
        >
          <ChevronLeft className="size-3 sm:size-4" />
        </Button>

        <span className="text-xs sm:text-sm px-2 sm:px-3">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="size-8 sm:size-9"
        >
          <ChevronRight className="size-3 sm:size-4" />
        </Button>
      </div>
      <div className="text-center text-xs text-muted-foreground mt-2">
        {totalItems} {labelPlural}
      </div>
    </div>
  );
}
