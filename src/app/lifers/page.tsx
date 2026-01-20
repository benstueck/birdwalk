import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { LifersList } from "@/components/LifersList";
import type { Lifer, LiferSighting } from "@/types/database";

interface SightingWithWalk {
  id: string;
  species_code: string;
  species_name: string;
  scientific_name: string | null;
  timestamp: string;
  walk_id: string;
  walks: {
    id: string;
    name: string;
    date: string;
  };
}

export default async function LifersPage() {
  const supabase = await createClient();

  const { data: sightingsData } = await supabase
    .from("sightings")
    .select(`
      id,
      species_code,
      species_name,
      scientific_name,
      timestamp,
      walk_id,
      walks(id, name, date)
    `)
    .order("timestamp", { ascending: false });

  const sightings = (sightingsData || []) as SightingWithWalk[];

  // Process sightings into unique lifers
  const lifersMap = new Map<string, Lifer>();

  for (const sighting of sightings) {
    const existing = lifersMap.get(sighting.species_code);

    const liferSighting: LiferSighting = {
      id: sighting.id,
      timestamp: sighting.timestamp,
      walk_id: sighting.walk_id,
      walk_name: sighting.walks?.name || "Unknown Walk",
      walk_date: sighting.walks?.date || "",
    };

    if (existing) {
      existing.total_sightings += 1;
      existing.sightings.push(liferSighting);
      // Update most_recent_sighting if this one is newer
      if (new Date(sighting.timestamp) > new Date(existing.most_recent_sighting)) {
        existing.most_recent_sighting = sighting.timestamp;
      }
    } else {
      lifersMap.set(sighting.species_code, {
        species_code: sighting.species_code,
        species_name: sighting.species_name,
        scientific_name: sighting.scientific_name,
        most_recent_sighting: sighting.timestamp,
        total_sightings: 1,
        sightings: [liferSighting],
      });
    }
  }

  // Convert to array and sort by most recent sighting
  const lifers = Array.from(lifersMap.values()).sort(
    (a, b) => new Date(b.most_recent_sighting).getTime() - new Date(a.most_recent_sighting).getTime()
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Life List</h1>
          <span className="text-slate-500">{lifers.length} species</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {lifers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No birds recorded yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Start a walk and record your first sighting
            </p>
          </div>
        ) : (
          <LifersList lifers={lifers} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
