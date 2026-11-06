/** Mean reference values used by the illustrative Solar System scene. Distances are in km. */
export const ASTRONOMICAL_UNIT_KM = 149_597_870.7;
export const SUN_RADIUS_KM = 696_340;
export const EARTH_RADIUS_KM = 6371;
export const MOON_RADIUS_KM = 1737.4;
export const EARTH_MOON_DISTANCE_KM = 384_400;

/** Mean orbital radii are measured values; angles are schematic, fixed display positions. */
export const PLANETS = [
  { name: 'Mercury', au: .387, radiusKm: 2439.7, angle: 1.8, color: 0x9b9893 },
  { name: 'Venus', au: .723, radiusKm: 6051.8, angle: 3.6, color: 0xd8b887 },
  { name: 'Earth', au: 1, radiusKm: EARTH_RADIUS_KM, angle: 0, color: 0x5e9dd6 },
  { name: 'Mars', au: 1.524, radiusKm: 3389.5, angle: .5, color: 0xc67554 },
  { name: 'Jupiter', au: 5.203, radiusKm: 69_911, angle: 2.2, color: 0xd4b899 },
  { name: 'Saturn', au: 9.537, radiusKm: 58_232, angle: 4.2, color: 0xc8ad7d },
  { name: 'Uranus', au: 19.19, radiusKm: 25_362, angle: .2, color: 0x83c9cc },
  { name: 'Neptune', au: 30.07, radiusKm: 24_622, angle: 2.8, color: 0x597fe0 },
] as const;

/** Pluto's current displayed position and orbit are schematic; the real orbit is eccentric. */
export const PLUTO = { radiusKm: 1188.3, au: 39.48, angle: 1.1 } as const;

export const SOLAR_SYSTEM_DATA_SOURCES = [
  { name: 'NASA Earth facts', url: 'https://science.nasa.gov/earth/facts/' },
  { name: 'NASA Moon facts', url: 'https://science.nasa.gov/moon/facts/' },
  { name: 'NASA Solar System facts', url: 'https://science.nasa.gov/solar-system/solar-system-facts/' },
] as const;
