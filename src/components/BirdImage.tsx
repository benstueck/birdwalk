"use client";

import { useState, useEffect } from "react";
/* eslint-disable @next/next/no-img-element */

interface BirdImageProps {
  speciesName: string;
  scientificName?: string | null;
  size?: "sm" | "md" | "lg" | "hero";
}

const sizeClasses = {
  sm: "w-10 h-10 rounded-full",
  md: "w-16 h-16 rounded-full",
  lg: "w-24 h-24 rounded-full",
  hero: "w-full aspect-[4/3] rounded-none",
};

const iconSizes = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  hero: "w-16 h-16",
};

// Client-side cache and request deduplication
const imageCache = new Map<string, string | null>();
const pendingRequests = new Map<string, Promise<string | null>>();

async function fetchBirdImage(speciesName: string, scientificName?: string | null): Promise<string | null> {
  const cacheKey = `${scientificName || ""}|${speciesName}`;

  // Return cached result
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Return pending request if one exists (deduplication)
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // Create new request
  const names = [scientificName, speciesName].filter(Boolean) as string[];
  const params = names.map(n => `name=${encodeURIComponent(n)}`).join("&");

  const promise = fetch(`/api/wikipedia/image?${params}`)
    .then(res => res.ok ? res.json() : null)
    .then(data => data?.imageUrl || null)
    .catch(() => null)
    .finally(() => pendingRequests.delete(cacheKey));

  pendingRequests.set(cacheKey, promise);

  const result = await promise;
  imageCache.set(cacheKey, result);
  return result;
}

export function BirdImage({ speciesName, scientificName, size = "md" }: BirdImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchBirdImage(speciesName, scientificName).then(url => {
      if (cancelled) return;
      setImageUrl(url);
      setHasError(url === null);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [speciesName, scientificName]);

  const containerClass = `${sizeClasses[size]} overflow-hidden flex-shrink-0`;

  if (isLoading) {
    return <div className={`${containerClass} bg-slate-200 animate-pulse`} />;
  }

  if (hasError || !imageUrl) {
    return (
      <div className={`${containerClass} bg-slate-100 flex items-center justify-center`}>
        <svg
          className={`${iconSizes[size]} text-slate-400`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M12 19.5c-4.5 0-8-2.5-8-5s3.5-5 8-5 8 2.5 8 5-3.5 5-8 5z" />
          <path d="M12 9.5V4M9 6.5l3-2.5 3 2.5" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <img
        src={imageUrl}
        alt={speciesName}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
