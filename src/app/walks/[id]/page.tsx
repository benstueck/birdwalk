import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { SightingCard } from "@/components/SightingCard";
import { AddSightingButton } from "@/components/AddSightingButton";
import { WalkDetailHeader } from "@/components/WalkDetailHeader";
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

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <WalkDetailHeader walk={walk} sightingCount={sightingCount} />

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {walk.notes && (
          <p className="text-slate-600 text-sm mb-4">{walk.notes}</p>
        )}

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
