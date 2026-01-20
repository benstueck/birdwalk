/**
 * Test script for Wikipedia image API
 * Run with: npx tsx scripts/test-wikipedia-api.ts
 */

// Convert to Wikipedia sentence case: "Common Raven" -> "Common raven"
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

// The fixed version with case conversion
async function tryFetchImage(name: string): Promise<string | null> {
  const wikiCase = toWikipediaCase(name);
  const result = await fetchWikipediaImage(wikiCase);
  if (result) return result;

  if (wikiCase !== name) {
    return await fetchWikipediaImage(name);
  }

  return null;
}

async function runTests() {
  console.log("Testing Wikipedia Image API\n");

  const testCases = [
    { name: "Corvus corax", description: "Scientific name (Common Raven)" },
    { name: "Common raven", description: "Common name" },
    { name: "Common Raven", description: "Common name (title case)" },
    { name: "Aythya affinis", description: "Scientific name (Lesser Scaup)" },
    { name: "Lesser scaup", description: "Common name" },
    { name: "Lesser Scaup", description: "Common name (title case)" },
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, description } of testCases) {
    const result = await fetchWikipediaImage(name);
    const hasImage = result !== null;
    const status = hasImage ? "✓" : "✗";
    console.log(`${status} "${name}" (${description}): ${hasImage ? "HAS IMAGE" : "NO IMAGE"}`);
    if (hasImage) passed++;
    else failed++;
  }

  console.log(`\n${passed} passed, ${failed} failed`);

  // Now test the FIXED logic with case conversion
  console.log("\n--- Testing FIXED logic with case conversion ---\n");

  const species = [
    { scientific: "Corvus corax", common: "Common Raven" },
    { scientific: "Aythya affinis", common: "Lesser Scaup" },
  ];

  for (const { scientific, common } of species) {
    console.log(`Testing ${common}:`);

    // Fixed logic: try scientific first, then common, with case conversion
    const namesToTry = [scientific, common].filter(Boolean);
    let foundImage = false;

    for (const name of namesToTry) {
      const result = await tryFetchImage(name);
      if (result) {
        console.log(`  ✓ Found image using: "${name}" (converted: "${toWikipediaCase(name)}")`);
        foundImage = true;
        break;
      } else {
        console.log(`  ✗ No image for: "${name}"`);
      }
    }

    if (!foundImage) {
      console.log(`  ✗ FAILED: No image found for ${common}`);
    } else {
      console.log(`  ✓ SUCCESS`);
    }
  }
}

runTests().catch(console.error);
