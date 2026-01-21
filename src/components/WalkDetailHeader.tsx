"use client";

import { useState } from "react";
import Link from "next/link";
import { WalkOptionsMenu } from "./WalkOptionsMenu";
import { WalkEditModal } from "./WalkEditModal";
import type { Walk } from "@/types/database";

interface WalkDetailHeaderProps {
  walk: Walk;
  sightingCount: number;
}

export function WalkDetailHeader({ walk, sightingCount }: WalkDetailHeaderProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate} @ ${formattedTime}`;
  };

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <Link
              href="/walks"
              className="mt-0.5 p-1 -ml-1 text-slate-400 hover:text-slate-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h1 className="text-xl font-semibold text-slate-900">
                  {walk.name}
                </h1>
                <span className="text-slate-600 font-medium">
                  {sightingCount} {sightingCount === 1 ? "Bird" : "Birds"}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {formatDate(walk.date, walk.start_time)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Floating options button - bottom left */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-20 pointer-events-none">
        <div className="max-w-lg mx-auto flex justify-start">
          <div className="pointer-events-auto">
            <WalkOptionsMenu walk={walk} onEdit={() => setShowEditModal(true)} />
          </div>
        </div>
      </div>

      {showEditModal && (
        <WalkEditModal walk={walk} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}
