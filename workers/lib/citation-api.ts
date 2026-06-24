/**
 * Real API-based citation submission handlers.
 * Each function tries to find or create the listing via the directory's API.
 * Returns success + listingUrl if found/created, or needsForm/needsManual to route elsewhere.
 */

export interface CitationApiResult {
  success: boolean;
  listingUrl?: string;
  needsForm?: boolean;
  needsManual?: boolean;
  error?: string;
}

export interface BusinessNAP {
  name: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  category: string;
}

// Foursquare Places API v3 — search if listing already exists; can't auto-create without user OAuth
export async function submitToFoursquare(business: BusinessNAP): Promise<CitationApiResult> {
  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey) return { success: false, needsForm: true, error: "FOURSQUARE_API_KEY not set" };

  try {
    const params = new URLSearchParams({
      query: business.name,
      near: `${business.city}, ${business.state}`,
      limit: "5",
    });
    const res = await fetch(`https://api.foursquare.com/v3/places/search?${params}`, {
      headers: { Authorization: apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return { success: false, needsForm: true, error: `Foursquare API ${res.status}` };

    const data = await res.json() as { results: Array<{ fsq_id: string; name: string; location?: { address?: string } }> };

    // Check if our business is already listed
    const match = data.results.find((v) =>
      v.name.toLowerCase().includes(business.name.split(" ")[0].toLowerCase())
    );

    if (match) {
      return {
        success: true,
        listingUrl: `https://foursquare.com/v/${match.fsq_id}`,
      };
    }

    // Not found — venue creation requires user-level OAuth, route to form
    return { success: false, needsForm: true, error: "Not yet listed; routing to form submission" };
  } catch (err) {
    return { success: false, needsForm: true, error: String(err) };
  }
}

// Bing Maps Business Listings — check via Bing Local Search if already indexed
export async function submitToBingPlaces(business: BusinessNAP): Promise<CitationApiResult> {
  const apiKey = process.env.BING_MAPS_API_KEY;
  if (!apiKey) return { success: false, needsForm: true, error: "BING_MAPS_API_KEY not set" };

  try {
    const params = new URLSearchParams({
      query: `${business.name} ${business.city} ${business.state}`,
      key: apiKey,
      maxResults: "5",
    });
    const res = await fetch(
      `https://dev.virtualearth.net/REST/v1/LocalSearch/?${params}`,
      { signal: AbortSignal.timeout(10_000) }
    );

    if (!res.ok) return { success: false, needsForm: true, error: `Bing API ${res.status}` };

    const data = await res.json() as {
      resourceSets?: Array<{
        resources?: Array<{ name?: string; Website?: string }>;
      }>;
    };
    const resources = data.resourceSets?.[0]?.resources ?? [];

    const match = resources.find((r) =>
      (r.name ?? "").toLowerCase().includes(business.name.split(" ")[0].toLowerCase())
    );

    if (match) {
      // Already indexed on Bing — direct to Bing Places add/claim URL
      return {
        success: true,
        listingUrl: `https://www.bingplaces.com/`,
      };
    }

    // Not found — route to form to claim/add on bingplaces.com
    return { success: false, needsForm: true, error: "Not indexed on Bing; routing to form" };
  } catch (err) {
    return { success: false, needsForm: true, error: String(err) };
  }
}

// Apple Maps Connect — requires Apple Business Connect API (partner access)
// For MVP: route directly to manual ops queue
export async function submitToAppleMaps(_business: BusinessNAP): Promise<CitationApiResult> {
  return {
    success: false,
    needsManual: true,
    error: "Apple Maps Connect requires partner credentials; queued for manual ops",
  };
}

// Generic API dispatcher — routes to the right handler by directory name
export async function submitViaApi(
  directoryName: string,
  business: BusinessNAP
): Promise<CitationApiResult> {
  const name = directoryName.toLowerCase();

  if (name.includes("foursquare")) return submitToFoursquare(business);
  if (name.includes("bing")) return submitToBingPlaces(business);
  if (name.includes("apple")) return submitToAppleMaps(business);

  // No known API for this directory — fall back to form
  return { success: false, needsForm: true, error: `No API handler for ${directoryName}` };
}
