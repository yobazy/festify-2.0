/**
 * Turns raw `event_location` strings ("Brooklyn, NY", "Illes Balears, Spain")
 * into the places people actually filter by: a metro or city, or a whole
 * state, province or country.
 */

export interface Place {
  /** URL value: "city:new-york" or "region:ca". */
  key: string;
  kind: "city" | "region";
  label: string;
  /** Secondary line: the state for a city, or the towns folded into a metro. */
  detail: string | null;
  count: number;
  /** Raw `event_location` values this place covers. */
  locations: Set<string>;
  /** Lowercased text the picker matches against. */
  search: string;
}

/**
 * Sprawling metros, keyed by the raw "City, ST" strings that belong to them.
 * Venues like Red Rocks (Morrison) or MetLife (Rutherford) are how people
 * plan a night in Denver or New York, so they fold into the metro.
 */
const METROS: Record<string, { label: string; region: string; members: string[] }> = {
  "new-york": {
    label: "New York",
    region: "NY",
    members: ["New York, NY", "Brooklyn, NY", "Queens, NY", "Port Chester, NY", "Huntington, NY", "Rutherford, NJ"],
  },
  "los-angeles": {
    label: "Los Angeles",
    region: "CA",
    members: ["Los Angeles, CA", "Commerce, CA", "Rowland Heights, CA", "Santa Ana, CA", "Costa Mesa, CA", "Huntington Beach, CA"],
  },
  "bay-area": {
    label: "Bay Area",
    region: "CA",
    members: ["San Francisco, CA", "San Jose, CA", "Oakland, CA", "Napa, CA"],
  },
  miami: {
    label: "Miami",
    region: "FL",
    members: ["Miami, FL", "Miami Beach, FL", "Fort Lauderdale, FL"],
  },
  denver: {
    label: "Denver",
    region: "CO",
    members: ["Denver, CO", "Morrison, CO", "Englewood, CO", "Boulder, CO"],
  },
  boston: { label: "Boston", region: "MA", members: ["Boston, MA", "Cambridge, MA"] },
  chicago: { label: "Chicago", region: "IL", members: ["Chicago, IL", "Bedford Park, IL"] },
  "salt-lake-city": {
    label: "Salt Lake City",
    region: "UT",
    members: ["Salt Lake City, UT", "West Valley City, UT", "Sandy, UT"],
  },
  detroit: { label: "Detroit", region: "MI", members: ["Detroit, MI", "Pontiac, MI", "Ferndale, MI"] },
  phoenix: { label: "Phoenix", region: "AZ", members: ["Phoenix, AZ", "Tempe, AZ"] },
  "twin-cities": { label: "Twin Cities", region: "MN", members: ["Minneapolis, MN", "Saint Paul, MN"] },
  orlando: { label: "Orlando", region: "FL", members: ["Orlando, FL", "Winter Park, FL"] },
  washington: { label: "Washington", region: "DC", members: ["Washington, DC", "Arlington, VA"] },
};

const METRO_BY_LOCATION = new Map<string, string>(
  Object.entries(METROS).flatMap(([slug, metro]) => metro.members.map((m) => [m, slug]))
);

const REGION_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland and Labrador", NS: "Nova Scotia", ON: "Ontario",
  PE: "Prince Edward Island", QC: "Quebec", SK: "Saskatchewan",
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** "Brooklyn, NY" → { city: "Brooklyn", region: "NY", regionName: "New York" }. */
function parseLocation(location: string) {
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  const city = parts[0] ?? location;
  const region = parts.length > 1 ? parts[parts.length - 1] : null;
  if (!region) return { city, region: null, regionName: null };
  // Two-letter tails are US states / Canadian provinces; anything else is a country.
  const regionName = REGION_NAMES[region.toUpperCase()] ?? region;
  return { city, region, regionName };
}

/**
 * Every place in `locations`, cities first (busiest first), then regions.
 * Regions only appear when they add something: a state with a single city
 * is the same filter as that city.
 */
export function buildPlaces(locations: Array<string | null | undefined>): Place[] {
  const cities = new Map<string, Place>();
  const regions = new Map<string, Place & { cityKeys: Set<string> }>();

  for (const raw of locations) {
    const location = raw?.trim();
    if (!location) continue;
    const { city, region, regionName } = parseLocation(location);

    const metroSlug = METRO_BY_LOCATION.get(location);
    const metro = metroSlug ? METROS[metroSlug] : null;
    const cityKey = `city:${metroSlug ?? slugify(location)}`;

    let cityPlace = cities.get(cityKey);
    if (!cityPlace) {
      cityPlace = {
        key: cityKey,
        kind: "city",
        label: metro?.label ?? city,
        detail: metro ? REGION_NAMES[metro.region] ?? metro.region : regionName,
        count: 0,
        locations: new Set(),
        search: "",
      };
      cities.set(cityKey, cityPlace);
    }
    cityPlace.count += 1;
    cityPlace.locations.add(location);

    if (region && regionName) {
      const regionKey = `region:${slugify(region)}`;
      let regionPlace = regions.get(regionKey);
      if (!regionPlace) {
        regionPlace = {
          key: regionKey,
          kind: "region",
          label: regionName,
          detail: null,
          count: 0,
          locations: new Set(),
          search: `${regionName} ${region}`.toLowerCase(),
          cityKeys: new Set(),
        };
        regions.set(regionKey, regionPlace);
      }
      regionPlace.count += 1;
      regionPlace.locations.add(location);
      regionPlace.cityKeys.add(cityKey);
    }
  }

  for (const place of cities.values()) {
    const towns = Array.from(place.locations).map((l) => parseLocation(l).city);
    const extraTowns = towns.filter((town) => town !== place.label);
    if (extraTowns.length > 0 && place.detail) {
      place.detail = `${place.detail}, incl. ${extraTowns.join(", ")}`;
    }
    place.search = [place.label, ...towns, ...Array.from(place.locations)].join(" ").toLowerCase();
  }

  const byCount = (a: Place, b: Place) => b.count - a.count || a.label.localeCompare(b.label);

  return [
    ...Array.from(cities.values()).sort(byCount),
    ...Array.from(regions.values())
      .filter((region) => region.cityKeys.size > 1)
      .map(({ cityKeys, ...place }) => ({ ...place, detail: `${cityKeys.size} cities` }))
      .sort(byCount),
  ];
}

/** Old `?location=Brooklyn, NY` links resolve to the place that covers that string. */
export function findPlaceForLocation(places: Place[], location: string) {
  const trimmed = location.trim();
  return places.find((place) => place.kind === "city" && place.locations.has(trimmed)) ?? null;
}

/** Matches a picker query against a place, ignoring accents ("montreal" finds Montréal). */
export function placeMatches(place: Place, query: string) {
  const q = query
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
  if (!q) return true;
  const haystack = place.search.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return haystack.includes(q);
}
