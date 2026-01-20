"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { searchSpecies, type EBirdSpecies } from "@/lib/ebird";

interface SpeciesAutocompleteProps {
  value: EBirdSpecies | null;
  onChange: (species: EBirdSpecies | null) => void;
  error?: string;
}

export function SpeciesAutocomplete({
  value,
  onChange,
  error,
}: SpeciesAutocompleteProps) {
  const [query, setQuery] = useState(value?.comName || "");
  const [results, setResults] = useState<EBirdSpecies[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value) {
      setQuery(value.comName);
    }
  }, [value]);

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

    if (value && searchQuery !== value.comName) {
      onChange(null);
    }

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
      const species = await searchSpecies(searchQuery);
      setResults(species);
      setIsOpen(species.length > 0);
      setIsLoading(false);
    }, 300);
  };

  const handleSelect = (species: EBirdSpecies) => {
    onChange(species);
    setQuery(species.comName);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder="Search species..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        error={error}
      />

      {isLoading && (
        <div className="absolute right-3 top-3">
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

      {isOpen && results.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          {results.map((species) => (
            <button
              key={species.speciesCode}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
              onClick={() => handleSelect(species)}
            >
              <span className="font-medium text-slate-900">
                {species.comName}
              </span>
              <span className="text-sm text-slate-500 ml-2">
                {species.sciName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
