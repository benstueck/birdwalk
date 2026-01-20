"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function NewWalkPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Request GPS location when page loads
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
          // Continue without location - it's optional
        }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a name for your walk");
      return;
    }

    setError("");
    setIsLoading(true);

    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setIsLoading(false);
      return;
    }

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const start_time = now.toTimeString().split(" ")[0];

    const insertData = {
      user_id: user.id,
      name: name.trim(),
      notes: notes.trim() || null,
      date,
      start_time,
      location_lat: location?.lat || null,
      location_lng: location?.lng || null,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: insertError } = await (supabase as any)
      .from("walks")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
      return;
    }

    router.push(`/walks/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-semibold text-slate-900 text-center">
            Start a Bird Walk
          </h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Textarea
            name="notes"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Start
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
