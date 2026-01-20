"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Stats {
  walkCount: number;
  speciesCount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<Stats>({ walkCount: 0, speciesCount: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
      }

      // Get walk count
      const { count: walkCount } = await supabase
        .from("walks")
        .select("*", { count: "exact", head: true });

      // Get unique species count
      const { data: sightings } = await supabase
        .from("sightings")
        .select("species_code");

      const uniqueSpecies = new Set(
        sightings?.map((s: { species_code: string }) => s.species_code)
      );

      setStats({
        walkCount: walkCount || 0,
        speciesCount: uniqueSpecies.size,
      });
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-semibold text-slate-900 text-center">
            Profile
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-slate-600">{email}</p>
        </div>

        <Card className="mb-8">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Walks</span>
              <span className="font-semibold text-slate-900">
                {stats.walkCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Species spotted</span>
              <span className="font-semibold text-slate-900">
                {stats.speciesCount}
              </span>
            </div>
          </div>
        </Card>

        <Button
          variant="secondary"
          className="w-full"
          onClick={handleLogout}
          isLoading={isLoading}
        >
          Log out
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
