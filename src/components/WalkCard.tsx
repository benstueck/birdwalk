"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Walk } from "@/types/database";

interface WalkCardProps {
  walk: Walk & { sighting_count: number };
}

export function WalkCard({ walk }: WalkCardProps) {
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
    <Link href={`/walks/${walk.id}`} className="block mb-3 last:mb-0">
      <Card as="button" className="w-full">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{walk.name}</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {formatDate(walk.date, walk.start_time)}
            </p>
          </div>
          <span className="text-slate-600 font-medium">
            {walk.sighting_count} {walk.sighting_count === 1 ? "Bird" : "Birds"}
          </span>
        </div>
      </Card>
    </Link>
  );
}
