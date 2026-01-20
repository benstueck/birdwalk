import { NextRequest, NextResponse } from "next/server";

interface WikipediaResponse {
  query?: {
    pages?: {
      [key: string]: {
        thumbnail?: {
          source: string;
        };
      };
    };
  };
}

// In-memory cache (persists for serverless function lifetime)
const cache = new Map<string, { url: string | null; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 1000;

function getCached(key: string): string | null | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return undefined;
  }
  return entry.url;
}

function setCache(key: string, url: string | null) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { url, ts: Date.now() });
}

// Convert to Wikipedia sentence case: "Common Raven" -> "Common raven"
function toWikipediaCase(name: string): string {
  return name
    .split(" ")
    .map((word, i) =>
      i === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase()
    )
    .join(" ");
}

async function fetchWikipediaImage(name: string): Promise<string | null> {
  const wikiName = toWikipediaCase(name);

  // Check cache
  const cached = getCached(wikiName);
  if (cached !== undefined) return cached;

  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiName)}&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=400`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data: WikipediaResponse = await response.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    const imageUrl = pageId !== "-1" ? (pages[pageId]?.thumbnail?.source || null) : null;

    setCache(wikiName, imageUrl);
    return imageUrl;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const names = request.nextUrl.searchParams.getAll("name");

  if (names.length === 0) {
    return NextResponse.json({ error: "name parameter is required" }, { status: 400 });
  }

  try {
    // Fetch all names in parallel, return first successful result
    const results = await Promise.all(names.map(fetchWikipediaImage));
    const imageUrl = results.find((url) => url !== null) || null;

    return NextResponse.json(
      { imageUrl },
      { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } }
    );
  } catch (error) {
    console.error("Wikipedia image fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
