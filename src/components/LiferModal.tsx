"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BirdImage } from "@/components/BirdImage";
import type { Lifer } from "@/types/database";

interface LiferModalProps {
  lifer: Lifer;
  onClose: () => void;
}

export function LiferModal({ lifer, onClose }: LiferModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg animate-slide-up max-h-[85vh] flex flex-col overflow-hidden">
        {/* Hero Image */}
        <div className="relative flex-shrink-0">
          <BirdImage
            speciesName={lifer.species_name}
            scientificName={lifer.scientific_name}
            size="hero"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white/90 hover:bg-black/50 transition-colors"
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

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-2xl font-semibold text-white drop-shadow-lg">
              {lifer.species_name}
            </h2>
            {lifer.scientific_name && (
              <p className="text-sm text-white/80 italic mt-0.5">
                {lifer.scientific_name}
              </p>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100 bg-slate-50">
          <span className="text-sm font-medium text-slate-600">
            {lifer.total_sightings} {lifer.total_sightings === 1 ? "sighting" : "sightings"}
          </span>
        </div>

        {/* Sightings list */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
            Sighting History
          </h3>
          <div className="space-y-2">
            {lifer.sightings.map((sighting) => (
              <Link
                key={sighting.id}
                href={`/walks/${sighting.walk_id}`}
                onClick={onClose}
                className="block p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">
                    {sighting.walk_name}
                  </span>
                  <span className="text-sm text-slate-500">
                    {formatDate(sighting.walk_date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
