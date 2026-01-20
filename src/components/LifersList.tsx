"use client";

import { useState } from "react";
import { LiferCard } from "@/components/LiferCard";
import { LiferModal } from "@/components/LiferModal";
import type { Lifer } from "@/types/database";

interface LifersListProps {
  lifers: Lifer[];
}

export function LifersList({ lifers }: LifersListProps) {
  const [selectedLifer, setSelectedLifer] = useState<Lifer | null>(null);

  return (
    <>
      <div className="space-y-3">
        {lifers.map((lifer) => (
          <LiferCard
            key={lifer.species_code}
            lifer={lifer}
            onSelect={() => setSelectedLifer(lifer)}
          />
        ))}
      </div>

      {selectedLifer && (
        <LiferModal
          lifer={selectedLifer}
          onClose={() => setSelectedLifer(null)}
        />
      )}
    </>
  );
}
