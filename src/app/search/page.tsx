"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface SpeciesResult {
  species_name: string;
  species_code: string;
  walks: { id: string; name: string }[];
}

interface WalkResult {
  id: string;
  name: string;
  date: string;
  sighting_count: number;
}

interface SightingWithWalk {
  species_name: string;
  species_code: string;
  walks: { id: string; name: string };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [speciesResults, setSpeciesResults] = useState<SpeciesResult[]>([]);
  const [walkResults, setWalkResults] = useState<WalkResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setSpeciesResults([]);
        setWalkResults([]);
        return;
      }

      setIsLoading(true);
      const supabase = createClient();

      // Search sightings by species name
      const { data: sightings } = await supabase
        .from("sightings")
        .select(`
          species_name,
          species_code,
          walks!inner (
            id,
            name
          )
        `)
        .ilike("species_name", `%${query}%`);

      // Search walks by name
      const { data: walks } = await supabase
        .from("walks")
        .select(`
          id,
          name,
          date,
          sightings(count)
        `)
        .ilike("name", `%${query}%`)
        .order("date", { ascending: false });

      if (sightings) {
        // Group by species
        const typedSightings = sightings as unknown as SightingWithWalk[];
        const grouped = typedSightings.reduce<Record<string, SpeciesResult>>(
          (acc, sighting) => {
            const key = sighting.species_code;
            if (!acc[key]) {
              acc[key] = {
                species_name: sighting.species_name,
                species_code: sighting.species_code,
                walks: [],
              };
            }
            const walk = sighting.walks;
            if (!acc[key].walks.find((w) => w.id === walk.id)) {
              acc[key].walks.push(walk);
            }
            return acc;
          },
          {}
        );

        setSpeciesResults(Object.values(grouped));
      }

      if (walks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedWalks = walks.map((w: any) => ({
          id: w.id,
          name: w.name,
          date: w.date,
          sighting_count: w.sightings?.[0]?.count || 0,
        }));
        setWalkResults(formattedWalks);
      }

      setIsLoading(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Run initial search if query param exists
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  return (
    <>
      {/* Header with Search Input */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* Back button */}
          <Link
            href="/walks"
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 flex-shrink-0"
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
            <Input
              placeholder="Search walks & birds..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-600 rounded-full mx-auto" />
          </div>
        )}

        {!isLoading && query.length >= 2 && walkResults.length === 0 && speciesResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No results found for &quot;{query}&quot;</p>
          </div>
        )}

        {!isLoading && (walkResults.length > 0 || speciesResults.length > 0) && (
          <>
            <p className="text-sm text-slate-500 mb-3">
              Results for &quot;{query}&quot;
            </p>

            {/* Walk results */}
            {walkResults.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Walks
                </h3>
                <div className="space-y-2">
                  {walkResults.map((walk) => (
                    <Link key={walk.id} href={`/walks/${walk.id}`}>
                      <Card className="hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">
                            {walk.name}
                          </h4>
                          <span className="text-sm text-slate-500">
                            {walk.sighting_count} {walk.sighting_count === 1 ? "bird" : "birds"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {new Date(walk.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Species results */}
            {speciesResults.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Birds
                </h3>
                <div className="space-y-2">
                  {speciesResults.map((result) => (
                    <Card key={result.species_code}>
                      <h4 className="font-semibold text-slate-900">
                        {result.species_name}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Seen in:{" "}
                        {result.walks.map((walk, i) => (
                          <span key={walk.id}>
                            {i > 0 && ", "}
                            <Link
                              href={`/walks/${walk.id}`}
                              className="text-slate-700 hover:underline"
                            >
                              {walk.name}
                            </Link>
                          </span>
                        ))}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!isLoading && query.length < 2 && (
          <div className="text-center py-12">
            <p className="text-slate-500">
              Enter at least 2 characters to search
            </p>
          </div>
        )}
      </main>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Suspense fallback={
        <div className="text-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-600 rounded-full mx-auto" />
        </div>
      }>
        <SearchContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}
