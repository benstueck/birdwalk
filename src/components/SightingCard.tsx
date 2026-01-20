"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { SightingModal } from "@/components/SightingModal";
import { BirdImage } from "@/components/BirdImage";
import type { Sighting } from "@/types/database";

interface SightingCardProps {
  sighting: Sighting;
  walkId: string;
}

export function SightingCard({ sighting, walkId }: SightingCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card
        as="button"
        onClick={() => setShowModal(true)}
        className="w-full"
      >
        <div className="flex items-center gap-3">
          <BirdImage
            speciesName={sighting.species_name}
            scientificName={sighting.scientific_name}
            size="sm"
          />
          <span className="font-medium text-slate-900">{sighting.species_name}</span>
        </div>
      </Card>

      {showModal && (
        <SightingModal
          sighting={sighting}
          walkId={walkId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
