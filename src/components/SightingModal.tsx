"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { BirdImage } from "@/components/BirdImage";
import { SpeciesAutocomplete } from "@/components/SpeciesAutocomplete";
import type { Sighting } from "@/types/database";
import type { EBirdSpecies } from "@/lib/ebird";

interface SightingModalProps {
  sighting: Sighting;
  walkId: string;
  onClose: () => void;
}

type ModalView = "details" | "confirm-delete" | "edit";

export function SightingModal({ sighting, walkId, onClose }: SightingModalProps) {
  const router = useRouter();
  const [view, setView] = useState<ModalView>("details");
  const [isDeleting, setIsDeleting] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Edit form state
  const [editSpecies, setEditSpecies] = useState<EBirdSpecies | null>({
    speciesCode: sighting.species_code,
    comName: sighting.species_name,
    sciName: sighting.scientific_name || "",
  });
  const [editType, setEditType] = useState<"seen" | "heard">(sighting.type);
  const [editNotes, setEditNotes] = useState(sighting.notes || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("sightings")
      .delete()
      .eq("id", sighting.id);

    if (error) {
      alert("Failed to delete sighting");
      setIsDeleting(false);
      return;
    }

    onClose();
    router.refresh();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editSpecies) {
      setEditError("Please select a species");
      return;
    }

    setEditError("");
    setIsUpdating(true);

    const supabase = createClient();

    const updateData = {
      species_code: editSpecies.speciesCode,
      species_name: editSpecies.comName,
      scientific_name: editSpecies.sciName || null,
      type: editType,
      notes: editNotes.trim() || null,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("sightings")
      .update(updateData)
      .eq("id", sighting.id);

    if (updateError) {
      setEditError(updateError.message);
      setIsUpdating(false);
      return;
    }

    onClose();
    router.refresh();
  };

  // Back button component
  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="p-2 -ml-2 text-slate-400 hover:text-slate-600"
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
    </button>
  );

  // Close button component
  const CloseButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={onClose}
      className={`p-2 text-slate-400 hover:text-slate-600 ${className}`}
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
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg animate-slide-up max-h-[90vh] flex flex-col overflow-hidden">

        {/* Details View */}
        {view === "details" && (
          <>
            {/* Hero Image */}
            <div className="relative flex-shrink-0">
              <BirdImage
                speciesName={sighting.species_name}
                scientificName={sighting.scientific_name}
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
                  {sighting.species_name}
                </h2>
                {sighting.scientific_name && (
                  <p className="text-sm text-white/80 italic mt-0.5">
                    {sighting.scientific_name}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-shrink-0 px-4 py-4 space-y-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Time</span>
                <span className="text-sm font-medium text-slate-900">{formatTime(sighting.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Type</span>
                <span className="text-sm font-medium text-slate-900">{sighting.type === "seen" ? "Seen" : "Heard"}</span>
              </div>
              {sighting.notes && (
                <div className="pt-2">
                  <span className="text-sm text-slate-500">Notes</span>
                  <p className="text-sm text-slate-900 mt-1">{sighting.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 p-4 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setView("edit")}
              >
                Edit
              </Button>
              <button
                onClick={() => setView("confirm-delete")}
                className="p-3 rounded-xl bg-slate-100 text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Delete Confirmation View */}
        {view === "confirm-delete" && (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <BackButton onClick={() => setView("details")} />
              <h2 className="text-xl font-semibold text-slate-900">
                Delete Sighting
              </h2>
            </div>

            {/* Content */}
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete this sighting?
              </p>
              <p className="text-lg font-medium text-slate-900">
                {sighting.species_name}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setView("details")}
              >
                No, Keep It
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        )}

        {/* Edit View */}
        {view === "edit" && (
          <div className="p-6 pb-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BackButton onClick={() => setView("details")} />
                <h2 className="text-xl font-semibold text-slate-900">
                  Edit Sighting
                </h2>
              </div>
              <CloseButton className="-mr-2" />
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="space-y-4">
              <SpeciesAutocomplete
                value={editSpecies}
                onChange={setEditSpecies}
                error={editError && !editSpecies ? "Please select a species" : undefined}
              />

              {/* Type toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditType("seen")}
                    className={`flex-1 h-12 rounded-full font-medium transition-colors ${
                      editType === "seen"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Seen
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType("heard")}
                    className={`flex-1 h-12 rounded-full font-medium transition-colors ${
                      editType === "heard"
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
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />

              {editError && editSpecies && (
                <p className="text-sm text-red-500 text-center">{editError}</p>
              )}

              <Button type="submit" className="w-full" isLoading={isUpdating}>
                Save
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
