"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { SpeciesAutocomplete } from "@/components/SpeciesAutocomplete";
import type { EBirdSpecies } from "@/lib/ebird";

interface RecordSightingModalProps {
  walkId: string;
  onClose: () => void;
}

export function RecordSightingModal({ walkId, onClose }: RecordSightingModalProps) {
  const router = useRouter();
  const [species, setSpecies] = useState<EBirdSpecies | null>(null);
  const [type, setType] = useState<"seen" | "heard">("seen");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.log("Geolocation error:", err.message);
        }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!species) {
      setError("Please select a species");
      return;
    }

    setError("");
    setIsLoading(true);

    const supabase = createClient();

    const insertData = {
      walk_id: walkId,
      species_code: species.speciesCode,
      species_name: species.comName,
      scientific_name: species.sciName || null,
      type,
      notes: notes.trim() || null,
      location_lat: location?.lat || null,
      location_lng: location?.lng || null,
      timestamp: new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any).from("sightings").insert(insertData);

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
      return;
    }

    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg p-6 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Record Sighting
          </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <SpeciesAutocomplete
            value={species}
            onChange={setSpecies}
            error={error && !species ? "Please select a species" : undefined}
          />

          {/* Type toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("seen")}
                className={`flex-1 h-12 rounded-full font-medium transition-colors ${
                  type === "seen"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Seen
              </button>
              <button
                type="button"
                onClick={() => setType("heard")}
                className={`flex-1 h-12 rounded-full font-medium transition-colors ${
                  type === "heard"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Heard
              </button>
            </div>
          </div>

          <Textarea
            name="notes"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && species && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Save
          </Button>
        </form>
      </div>
    </div>
  );
}
