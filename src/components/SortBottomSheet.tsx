"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type SortOption = "date-desc" | "date-asc" | "count-desc" | "count-asc";

interface SortBottomSheetProps {
  currentSort: SortOption;
  onClose: () => void;
}

const sortOptions = {
  date: [
    { value: "date-desc" as const, label: "Newest first" },
    { value: "date-asc" as const, label: "Oldest first" },
  ],
  count: [
    { value: "count-desc" as const, label: "Most sightings" },
    { value: "count-asc" as const, label: "Fewest sightings" },
  ],
};

export function SortBottomSheet({ currentSort, onClose }: SortBottomSheetProps) {
  const router = useRouter();

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSelect = (value: SortOption) => {
    // Omit sort param when using default (cleaner URLs)
    if (value === "date-desc") {
      router.push("/walks");
    } else {
      router.push(`/walks?sort=${value}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg p-6 pb-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Sort by</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sort Options */}
        <div className="space-y-6">
          {/* Date Group */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Date</h3>
            <div className="space-y-2">
              {sortOptions.date.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                    currentSort === option.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bird Count Group */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Bird Count</h3>
            <div className="space-y-2">
              {sortOptions.count.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                    currentSort === option.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
