/**
 * Backfill script to populate scientific_name for existing sightings
 *
 * Run with: npx tsx scripts/backfill-scientific-names.ts
 *
 * Requires:
 * - EBIRD_API_KEY in .env.local
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (or SUPABASE_SERVICE_ROLE_KEY for admin access)
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EBIRD_API_KEY = process.env.EBIRD_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

if (!EBIRD_API_KEY) {
  console.error("Missing EBIRD_API_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface EBirdTaxon {
  speciesCode: string;
  sciName: string;
  comName: string;
}

async function fetchEBirdTaxonomy(): Promise<Map<string, string>> {
  console.log("Fetching eBird taxonomy...");

  const response = await fetch(
    "https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species",
    {
      headers: {
        "X-eBirdApiToken": EBIRD_API_KEY!,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`eBird API error: ${response.status}`);
  }

  const taxonomy: EBirdTaxon[] = await response.json();
  console.log(`Loaded ${taxonomy.length} species from eBird taxonomy`);

  // Create a map of species_code -> scientific_name
  const speciesMap = new Map<string, string>();
  for (const taxon of taxonomy) {
    speciesMap.set(taxon.speciesCode, taxon.sciName);
  }

  return speciesMap;
}

async function backfillSightings(speciesMap: Map<string, string>) {
  // Fetch sightings missing scientific_name
  console.log("\nFetching sightings missing scientific_name...");

  const { data: sightings, error } = await supabase
    .from("sightings")
    .select("id, species_code, species_name")
    .is("scientific_name", null);

  if (error) {
    throw new Error(`Failed to fetch sightings: ${error.message}`);
  }

  if (!sightings || sightings.length === 0) {
    console.log("No sightings need updating!");
    return;
  }

  console.log(`Found ${sightings.length} sightings to update`);

  // Update each sighting
  let updated = 0;
  let notFound = 0;

  for (const sighting of sightings) {
    const scientificName = speciesMap.get(sighting.species_code);

    if (scientificName) {
      const { error: updateError } = await supabase
        .from("sightings")
        .update({ scientific_name: scientificName })
        .eq("id", sighting.id);

      if (updateError) {
        console.error(`Failed to update sighting ${sighting.id}: ${updateError.message}`);
      } else {
        updated++;
        console.log(`✓ ${sighting.species_name} → ${scientificName}`);
      }
    } else {
      notFound++;
      console.log(`✗ No scientific name found for species_code: ${sighting.species_code} (${sighting.species_name})`);
    }
  }

  console.log(`\nDone! Updated ${updated} sightings, ${notFound} species codes not found in taxonomy`);
}

async function main() {
  try {
    const speciesMap = await fetchEBirdTaxonomy();
    await backfillSightings(speciesMap);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
