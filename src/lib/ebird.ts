export interface EBirdSpecies {
  speciesCode: string;
  comName: string;
  sciName: string;
}

export async function searchSpecies(query: string): Promise<EBirdSpecies[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `/api/ebird/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Failed to search species");
    }

    return response.json();
  } catch (error) {
    console.error("eBird search error:", error);
    return [];
  }
}
