"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { SpeciesAutocomplete } from "@/components/SpeciesAutocomplete";
import type { EBirdSpecies } from "@/lib/ebird";
import type { Sighting } from "@/types/database";

type SightingType = "seen" | "heard";

interface SightingPageProps {
  params: Promise<{ id: string }>;
}

export default function SightingPage({ params }: SightingPageProps) {
  const { id: walkId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [species, setSpecies] = useState<EBirdSpecies | null>(null);
  const [type, setType] = useState<"seen" | "heard">("seen");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [existingSighting, setExistingSighting] = useState<Sighting | null>(null);

  useEffect(() => {
    // Request GPS location
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

  useEffect(() => {
    // Load existing sighting if editing
    if (editId) {
      const loadSighting = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("sightings")
          .select("*")
          .eq("id", editId)
          .single();

        if (data) {
          const sighting = data as Sighting;
          setExistingSighting(sighting);
          setSpecies({
            speciesCode: sighting.species_code,
            comName: sighting.species_name,
            sciName: sighting.scientific_name || "",
          });
          setType(sighting.type);
          setNotes(sighting.notes || "");
        }
      };
      loadSighting();
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!species) {
      setError("Please select a species");
      return;
    }

    setError("");
    setIsLoading(true);

    const supabase = createClient();

    if (editId && existingSighting) {
      // Update existing sighting
      const updateData = {
        species_code: species.speciesCode,
        species_name: species.comName,
        scientific_name: species.sciName || null,
        type,
        notes: notes.trim() || null,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from("sightings")
        .update(updateData)
        .eq("id", editId);

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }
    } else {
      // Create new sighting
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
    }

    router.push(`/walks/${walkId}`);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            href={`/walks/${walkId}`}
            className="p-1 -ml-1 text-slate-400 hover:text-slate-600"
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
          <h1 className="text-xl font-semibold text-slate-900">
            {editId ? "Edit Sighting" : "Record Sighting"}
          </h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
      </main>

      <BottomNav />
    </div>
  );
}
