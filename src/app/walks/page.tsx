import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { WalkCard } from "@/components/WalkCard";
import { WalksActionButtons } from "@/components/WalksActionButtons";
import { Button } from "@/components/ui/Button";
import type { Walk } from "@/types/database";

interface WalkWithSightings extends Walk {
  sightings: { count: number }[];
}

export default async function WalksPage() {
  const supabase = await createClient();

  const { data: walksData } = await supabase
    .from("walks")
    .select(`
      *,
      sightings(count)
    `)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  const walks = (walksData || []) as WalkWithSightings[];

  const walksWithCount = walks.map((walk) => ({
    ...walk,
    sighting_count: walk.sightings?.[0]?.count || 0,
  }));

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Bird Walks</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {walksWithCount.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No walks yet</p>
            <Link href="/walks/new">
              <Button>Start your first walk</Button>
            </Link>
          </div>
        ) : (
          <div>
            {walksWithCount.map((walk) => (
              <WalkCard key={walk.id} walk={walk} />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Action Buttons */}
      <WalksActionButtons />

      <BottomNav />
    </div>
  );
}
