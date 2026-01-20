import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { WalkCard } from "@/components/WalkCard";
import { WalksActionButtons } from "@/components/WalksActionButtons";
import { SortButton } from "@/components/SortButton";
import { Button } from "@/components/ui/Button";
import type { Walk } from "@/types/database";

type SortOption = "date-desc" | "date-asc" | "count-desc" | "count-asc";

interface WalkWithSightings extends Walk {
  sightings: { count: number }[];
}

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function WalksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sortParam = params.sort;

  // Validate sort parameter, default to date-desc
  const validSorts: SortOption[] = ["date-desc", "date-asc", "count-desc", "count-asc"];
  const sort: SortOption = validSorts.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "date-desc";

  const supabase = await createClient();

  // Determine date ordering from sort parameter
  const dateAscending = sort === "date-asc";

  const { data: walksData } = await supabase
    .from("walks")
    .select(`
      *,
      sightings(count)
    `)
    .order("date", { ascending: dateAscending })
    .order("start_time", { ascending: dateAscending });

  const walks = (walksData || []) as WalkWithSightings[];

  let walksWithCount = walks.map((walk) => ({
    ...walk,
    sighting_count: walk.sightings?.[0]?.count || 0,
  }));

  // Apply count-based sorting in JS (Supabase can't order by aggregated count)
  if (sort === "count-desc") {
    walksWithCount = walksWithCount.sort((a, b) => b.sighting_count - a.sighting_count);
  } else if (sort === "count-asc") {
    walksWithCount = walksWithCount.sort((a, b) => a.sighting_count - b.sighting_count);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Bird Walks</h1>
          <SortButton currentSort={sort} />
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
