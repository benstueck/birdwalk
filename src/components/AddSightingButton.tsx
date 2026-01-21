"use client";

import { useState } from "react";
import { RecordSightingModal } from "@/components/RecordSightingModal";

interface AddSightingButtonProps {
  walkId: string;
}

export function AddSightingButton({ walkId }: AddSightingButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-20 pointer-events-none">
        <div className="max-w-lg mx-auto flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer pointer-events-auto"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {showModal && (
        <RecordSightingModal
          walkId={walkId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
