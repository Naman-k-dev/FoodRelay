/**
 * Calculates straight-line geographic distance between two coordinates
 * using the Haversine formula.
 *
 * Clearly labeled as estimated straight-line (geodesic) distance,
 * NOT actual driving route distance.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const R = 6371; // Earth's mean radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to one decimal place for clarity
  return Math.round(distance * 10) / 10;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Returns estimated transit duration in minutes based on average urban speed (20 km/h)
 * Clearly labeled as an illustrative benchmark estimate.
 */
export function estimateIllustrativeTransitMinutes(distanceKm: number): number {
  const avgSpeedKmh = 20; // illustrative urban speed benchmark
  const bufferMinutes = 10; // staging/handover buffer
  return Math.round((distanceKm / avgSpeedKmh) * 60 + bufferMinutes);
}
