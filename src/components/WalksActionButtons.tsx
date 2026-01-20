"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NewWalkModal } from "@/components/NewWalkModal";
import { Footprints, Bird } from "lucide-react";

interface SpeciesResult {
  type: "species";
  species_name: string;
  species_code: string;
}

interface WalkResult {
  type: "walk";
  id: string;
  name: string;
}

type SearchResult = SpeciesResult | WalkResult;

export function WalksActionButtons() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const supabase = createClient();

      // Search species
      const { data: sightings } = await supabase
        .from("sightings")
        .select("species_name, species_code")
        .ilike("species_name", `%${searchQuery}%`) as { data: { species_name: string; species_code: string }[] | null };

      // Search walks
      const { data: walks } = await supabase
        .from("walks")
        .select("id, name")
        .ilike("name", `%${searchQuery}%`) as { data: { id: string; name: string }[] | null };

      const combined: SearchResult[] = [];

      if (walks) {
        walks.forEach((w) => {
          combined.push({ type: "walk", id: w.id, name: w.name });
        });
      }

      if (sightings) {
        const unique = Array.from(
          new Map(sightings.map((s) => [s.species_code, s])).values()
        );
        unique.forEach((s) => {
          combined.push({ type: "species", ...s });
        });
      }

      setResults(combined);
      setIsOpen(combined.length > 0);
      setIsLoading(false);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.type === "walk") {
      router.push(`/walks/${result.id}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(result.species_name)}`);
    }
  };

  return (
    <>
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* Search Input */}
          <div ref={containerRef} className="relative flex-1">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search walks & birds..."
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => results.length > 0 && setIsOpen(true)}
                  className="w-full h-12 pl-10 pr-4 bg-slate-100 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="animate-spin h-5 w-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </form>

            {/* Autocomplete dropdown */}
            {isOpen && results.length > 0 && (
              <div className="absolute z-20 w-full bottom-full mb-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={result.type === "walk" ? `walk-${result.id}` : `species-${result.species_code}`}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center gap-3"
                    onClick={() => handleSelect(result)}
                  >
                    {result.type === "walk" ? (
                      <>
                        <Footprints className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-900">{result.name}</span>
                      </>
                    ) : (
                      <>
                        <Bird className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-900">{result.species_name}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {showModal && <NewWalkModal onClose={() => setShowModal(false)} />}
    </>
  );
}
