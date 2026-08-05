/**
 * Returns a fuzzed lat/lng by randomly offsetting within ~300m radius.
 * Used to protect the real property address while still showing a map area.
 */
export function fuzzeLocation(
  realLat: number,
  realLng: number,
  radiusMeters = 300,
): { lat: number; lng: number } {
  // 1 degree latitude ≈ 111,000 m
  const latOffset = (Math.random() * 2 - 1) * (radiusMeters / 111000);
  const lngOffset =
    (Math.random() * 2 - 1) * (radiusMeters / (111000 * Math.cos((realLat * Math.PI) / 180)));

  return {
    lat: realLat + latOffset,
    lng: realLng + lngOffset,
  };
}
