import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const apiKey = process.env.EBIRD_API_KEY;

  if (!apiKey) {
    console.error("EBIRD_API_KEY not configured");
    return NextResponse.json(
      { error: "eBird API not configured" },
      { status: 500 }
    );
  }

  try {
    // Use eBird taxonomy API to search for species
    const response = await fetch(
      `https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species`,
      {
        headers: {
          "X-eBirdApiToken": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`eBird API error: ${response.status}`);
    }

    const allSpecies = await response.json();

    // Filter species by query (case-insensitive search on common name)
    const queryLower = query.toLowerCase();
    const filtered = allSpecies
      .filter((species: { comName: string }) =>
        species.comName.toLowerCase().includes(queryLower)
      )
      .slice(0, 10)
      .map((species: { speciesCode: string; comName: string; sciName: string }) => ({
        speciesCode: species.speciesCode,
        comName: species.comName,
        sciName: species.sciName,
      }));

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("eBird search error:", error);
    return NextResponse.json(
      { error: "Failed to search species" },
      { status: 500 }
    );
  }
}
