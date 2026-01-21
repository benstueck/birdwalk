"use client";

import { useState } from "react";
import { SortBottomSheet } from "@/components/SortBottomSheet";

type SortOption = "date-desc" | "date-asc" | "count-desc" | "count-asc";

interface SortButtonProps {
  currentSort: SortOption;
}

export function SortButton({ currentSort }: SortButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isNonDefault = currentSort !== "date-desc";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        {isNonDefault && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <SortBottomSheet
          currentSort={currentSort}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
