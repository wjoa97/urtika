export interface CityCoordinates {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  }>;
}

/**
 * Free geocoding via Open-Meteo Geocoding API (Worldwide, no API key required, fast & reliable).
 */
export async function searchGlobalCity(query: string): Promise<CityCoordinates[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=5&language=es&format=json`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data: GeocodingResult = await res.json();
    if (!data.results) return [];

    return data.results.map((r) => ({
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}
