import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { SightingCard } from "@/components/SightingCard";
import { AddSightingButton } from "@/components/AddSightingButton";
import type { Walk, Sighting } from "@/types/database";

interface WalkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WalkDetailPage({ params }: WalkDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: walkData } = await supabase
    .from("walks")
    .select("*")
    .eq("id", id)
    .single();

  if (!walkData) {
    notFound();
  }

  const walk = walkData as Walk;

  const { data: sightingsData } = await supabase
    .from("sightings")
    .select("*")
    .eq("walk_id", id)
    .order("timestamp", { ascending: false });

  const sightings = (sightingsData || []) as Sighting[];

  const sightingCount = sightings?.length || 0;

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
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between">
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
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {walk.name}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {formatDate(walk.date, walk.start_time)}
                </p>
              </div>
            </div>
            <span className="text-slate-600 font-medium">
              {sightingCount} {sightingCount === 1 ? "Bird" : "Birds"}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {sightings.length > 0 ? (
          <div className="space-y-3">
            {sightings.map((sighting) => (
              <SightingCard key={sighting.id} sighting={sighting} walkId={id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No sightings yet</p>
          </div>
        )}
      </main>

      {/* Record Sighting Button */}
      <AddSightingButton walkId={id} />

      <BottomNav />
    </div>
  );
}
