"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footprints, Bird, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/walks") {
      return pathname === "/walks" || pathname.startsWith("/walks/");
    }
    if (path === "/lifers") {
      return pathname === "/lifers";
    }
    return pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {/* Walks */}
        <Link
          href="/walks"
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
            isActive("/walks")
              ? "text-slate-900"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Footprints className="w-6 h-6" />
        </Link>

        {/* Lifers */}
        <Link
          href="/lifers"
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
            isActive("/lifers")
              ? "text-slate-900"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Bird className="w-6 h-6" />
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
            isActive("/profile")
              ? "text-slate-900"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <User className="w-6 h-6" />
        </Link>
      </div>
    </nav>
  );
}
