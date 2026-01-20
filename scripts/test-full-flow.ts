/**
 * Test the full image fetching flow
 * Run with: npx tsx scripts/test-full-flow.ts
 */

// Copy of the API route logic
function toWikipediaCase(name: string): string {
  const words = name.split(" ");
  return words
    .map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    })
    .join(" ");
}

async function fetchWikipediaImage(name: string): Promise<string | null> {
  const encodedName = encodeURIComponent(name);
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodedName}&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=400`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const pages = data.query?.pages;
  if (!pages) return null;

  const pageId = Object.keys(pages)[0];
  if (pageId === "-1") return null;

  return pages[pageId]?.thumbnail?.source || null;
}

async function tryFetchImage(name: string): Promise<string | null> {
  const wikiCase = toWikipediaCase(name);
  const result = await fetchWikipediaImage(wikiCase);
  if (result) return result;

  if (wikiCase !== name) {
    return await fetchWikipediaImage(name);
  }

  return null;
}

// Simulate what BirdImage component does
async function simulateBirdImageComponent(speciesName: string, scientificName: string | null) {
  console.log(`\nSimulating BirdImage for: ${speciesName}`);
  console.log(`  speciesName: "${speciesName}"`);
  console.log(`  scientificName: "${scientificName}"`);

  const namesToTry = [scientificName, speciesName].filter(Boolean) as string[];
  console.log(`  namesToTry: ${JSON.stringify(namesToTry)}`);

  for (const name of namesToTry) {
    console.log(`  Trying: "${name}"`);

    // This is what the API route does
    const imageUrl = await tryFetchImage(name);

    if (imageUrl) {
      console.log(`  ✓ SUCCESS: Found image`);
      console.log(`  URL: ${imageUrl}`);
      return imageUrl;
    } else {
      console.log(`  ✗ No image for "${name}"`);
    }
  }

  console.log(`  ✗ FAILED: No image found`);
  return null;
}

async function main() {
  // Test with the actual data from the database
  const testCases = [
    { speciesName: "Common Raven", scientificName: "Corvus corax" },
    { speciesName: "Lesser Scaup", scientificName: "Aythya affinis" },
  ];

  console.log("=== Testing Full BirdImage Flow ===");

  for (const { speciesName, scientificName } of testCases) {
    await simulateBirdImageComponent(speciesName, scientificName);
  }
}

main().catch(console.error);
