import { LIGHT_YEAR_METERS } from './stellar-neighborhood';
import { SUN_TO_GALACTIC_CENTER_LY } from './milky-way';

/** Original itinerary framing target; the Local Group has no sharp outer edge. */
export const LOCAL_GROUP_VIEW_WIDTH_LY = 10_000_000;
export const LOCAL_GROUP_VIEW_WIDTH_METERS = LOCAL_GROUP_VIEW_WIDTH_LY * LIGHT_YEAR_METERS;

/** Galactic display frame: x/y in the Milky Way disk, z toward its north pole. */
export const LOCAL_GROUP_SUN_POSITION_LY: [number, number, number] = [0, -SUN_TO_GALACTIC_CENTER_LY, 0];

/** ICRS J2000 unit vectors transformed to Galactic coordinates, then rotated so
 * the Milky Way disk remains on the same XY plane used by the previous chapter.
 */
const ICRS_TO_GALACTIC = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [0.4941094279, -0.44482963, 0.7469822445],
  [-0.867666149, -0.1980763734, 0.4559837762],
] as const;

function fromIcrs(raDegrees: number, decDegrees: number, distanceLy: number): [number, number, number] {
  const ra = raDegrees * Math.PI / 180;
  const dec = decDegrees * Math.PI / 180;
  const equatorial = [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  const [galacticX, galacticY, galacticZ] = ICRS_TO_GALACTIC.map((row) =>
    row.reduce((sum, component, index) => sum + component * equatorial[index], 0),
  );
  // Standard galactic +X points from the Galactic Center toward the Sun. In the
  // previous scene, that same direction is negative display Y.
  return [
    galacticY * distanceLy,
    -galacticX * distanceLy - SUN_TO_GALACTIC_CENTER_LY,
    galacticZ * distanceLy,
  ];
}

/** Approximate, source-backed group members. Positions are display anchors, not
 * a precision dynamical solution; markers are enhanced for readability.
 */
export const LOCAL_GROUP_GALAXIES = [
  {
    id: 'milky-way', name: 'Milky Way', distanceFromSunLy: 0, diameterLy: 100_000,
    positionLy: [0, 0, 0] as [number, number, number], color: 0x9fc7ff, seed: 41,
    armCount: 4, diskThicknessRatio: .035, displayTiltDegrees: 0,
  },
  {
    id: 'andromeda', name: 'Andromeda · M31', distanceFromSunLy: 2_500_000, diameterLy: 152_000,
    positionLy: fromIcrs(10.6847083, 41.26875, 2_500_000), color: 0xffc88e, seed: 73,
    armCount: 2, diskThicknessRatio: .018, displayTiltDegrees: 63,
  },
  {
    id: 'triangulum', name: 'Triangulum · M33', distanceFromSunLy: 2_730_000, diameterLy: 60_000,
    positionLy: fromIcrs(23.4621, 30.6599, 2_730_000), color: 0x98d4ff, seed: 97,
    armCount: 2, diskThicknessRatio: .025, displayTiltDegrees: -38,
  },
] as const;

/** A framing point halfway between the two dominant galaxies, not a measured barycenter. */
export const LOCAL_GROUP_FRAME_CENTER_LY: [number, number, number] = [
  LOCAL_GROUP_GALAXIES[1].positionLy[0] / 2,
  LOCAL_GROUP_GALAXIES[1].positionLy[1] / 2,
  LOCAL_GROUP_GALAXIES[1].positionLy[2] / 2,
];

export const LOCAL_GROUP_SOURCES = [
  { name: 'NASA Science: Andromeda Galaxy', url: 'https://www.nasa.gov/universe/galaxies/andromeda-galaxy/' },
  { name: 'NASA Hubble: The Milky Way, Andromeda, and Triangulum', url: 'https://science.nasa.gov/asset/hubble/the-fate-of-the-milky-way-andromeda-and-triangulum-galaxies/' },
  { name: 'ESA Gaia: Milky Way–Andromeda–Triangulum', url: 'https://www.esa.int/Science_Exploration/Space_Science/Gaia/Gaia_clocks_new_speeds_for_Milky_Way-Andromeda_collision' },
  { name: 'SIMBAD Astronomical Database', url: 'https://simbad.cds.unistra.fr/simbad/' },
] as const;
