import { LIGHT_YEAR_KM, LIGHT_YEAR_METERS, SUN_ANCHOR_KM } from './stellar-neighborhood';

/** Framing target from the journey itinerary; this is not a measured galaxy boundary. */
export const MILKY_WAY_VIEW_WIDTH_LY = 150_000;
export const MILKY_WAY_DISK_MODEL_RADIUS_LY = 50_000;
export const SUN_TO_GALACTIC_CENTER_LY = 26_000;

/** Galactic display coordinates: x/y lie in the disk plane, z is vertical. */
export const GALACTIC_CENTER_FROM_SUN_LY: [number, number, number] = [0, SUN_TO_GALACTIC_CENTER_LY, 0];
export const GALACTIC_CENTER_POSITION_KM: [number, number, number] = [
  SUN_ANCHOR_KM[0] + GALACTIC_CENTER_FROM_SUN_LY[0] * LIGHT_YEAR_KM,
  SUN_ANCHOR_KM[1] + GALACTIC_CENTER_FROM_SUN_LY[1] * LIGHT_YEAR_KM,
  SUN_ANCHOR_KM[2] + GALACTIC_CENTER_FROM_SUN_LY[2] * LIGHT_YEAR_KM,
];
export const MILKY_WAY_VIEW_WIDTH_METERS = MILKY_WAY_VIEW_WIDTH_LY * LIGHT_YEAR_METERS;

/** Tunable reconstruction parameters, not a claim that the Galaxy has crisp edges. */
export const MILKY_WAY_MODEL = {
  seed: 20_261_107,
  mainArmCount: 4,
  spiralPitchDegrees: 12,
  armStartRadiusLy: 6_000,
  diskModelRadiusLy: MILKY_WAY_DISK_MODEL_RADIUS_LY,
  diskThicknessLy: 1_000,
  barHalfLengthLy: 10_000,
  barHalfWidthLy: 2_200,
  bulgeRadiusLy: 6_000,
  localSpurHalfLengthLy: 8_000,
  haloModelRadiusLy: 75_000,
} as const;

export const MILKY_WAY_SOURCES = [
  { name: 'NASA Science: Galaxies', url: 'https://science.nasa.gov/universe/galaxies/' },
  { name: 'NASA GSFC: Imagine the Universe — The Milky Way', url: 'https://imagine.gsfc.nasa.gov/science/featured_science/milkyway/index.html' },
  { name: 'ESA: Guide to our galaxy', url: 'https://www.esa.int/content/view/full/423444' },
  { name: 'ESA: Top-down view of the Milky Way', url: 'https://www.esa.int/ESA_Multimedia/Images/2023/12/Top-down_view_of_the_Milky_Way' },
] as const;
