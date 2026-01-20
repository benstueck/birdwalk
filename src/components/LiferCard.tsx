"use client";

import { Card } from "@/components/ui/Card";
import { BirdImage } from "@/components/BirdImage";
import type { Lifer } from "@/types/database";

interface LiferCardProps {
  lifer: Lifer;
  onSelect: () => void;
}

export function LiferCard({ lifer, onSelect }: LiferCardProps) {
  return (
    <Card as="button" onClick={onSelect} className="w-full">
      <div className="flex items-center gap-3">
        <BirdImage
          speciesName={lifer.species_name}
          scientificName={lifer.scientific_name}
          size="sm"
        />
        <div className="flex-1 text-left">
          <span className="font-medium text-slate-900">{lifer.species_name}</span>
        </div>
        <span className="text-sm text-slate-400">
          {lifer.total_sightings} {lifer.total_sightings === 1 ? "sighting" : "sightings"}
        </span>
      </div>
    </Card>
  );
}
