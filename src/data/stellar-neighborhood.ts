import { ASTRONOMICAL_UNIT_KM } from './solar-system';

export const LIGHT_YEAR_KM = 9_460_730_472_580;
export const LIGHT_YEAR_METERS = LIGHT_YEAR_KM * 1000;
export const SUN_ANCHOR_KM: [number, number, number] = [-ASTRONOMICAL_UNIT_KM, 0, 0];

/** SIMBAD ICRS J2000 coordinates and parallax snapshot; distances are computed from parallax. */
export const NEARBY_STARS = [
  { id: 'proxima-centauri', name: 'Proxima Centauri', simbad: 'Proxima Centauri', raDeg: 217.428942, decDeg: -62.679490, parallaxMas: 768.0665, color: 0xffaa75, labelIn: 'nearest' },
  { id: 'alpha-centauri', name: 'Alpha Centauri system', simbad: 'Alpha Centauri A', raDeg: 219.902058, decDeg: -60.833993, parallaxMas: 742.12, color: 0xffe2a6, labelIn: 'nearest' },
  { id: 'barnards-star', name: "Barnard's Star", simbad: "Barnard's Star", raDeg: 269.452077, decDeg: 4.693365, parallaxMas: 546.9759, color: 0xff9673, labelIn: 'neighborhood' },
  { id: 'wolf-359', name: 'Wolf 359', simbad: 'Wolf 359', raDeg: 164.120504, decDeg: 7.014723, parallaxMas: 415.1794, color: 0xff9474, labelIn: 'neighborhood' },
  { id: 'lalande-21185', name: 'Lalande 21185', simbad: 'Lalande 21185', raDeg: 165.834145, decDeg: 35.969882, parallaxMas: 392.7529, color: 0xffc18a, labelIn: 'none' },
  { id: 'sirius', name: 'Sirius', simbad: 'Sirius', raDeg: 101.287155, decDeg: -16.716116, parallaxMas: 379.21, color: 0xc9e2ff, labelIn: 'neighborhood' },
  { id: 'ross-154', name: 'Ross 154', simbad: 'Ross 154', raDeg: 282.455682, decDeg: -23.836235, parallaxMas: 336.0266, color: 0xff9e79, labelIn: 'none' },
  { id: 'epsilon-eridani', name: 'Epsilon Eridani', simbad: 'Epsilon Eridani', raDeg: 53.232685, decDeg: -9.458261, parallaxMas: 310.5773, color: 0xffc58c, labelIn: 'none' },
  { id: '61-cygni', name: '61 Cygni', simbad: '61 Cygni A', raDeg: 316.724748, decDeg: 38.749417, parallaxMas: 285.9949, color: 0xffbd87, labelIn: 'none' },
  { id: 'procyon', name: 'Procyon', simbad: 'Procyon', raDeg: 114.825498, decDeg: 5.224988, parallaxMas: 284.56, color: 0xffe3ad, labelIn: 'neighborhood' },
  { id: 'tau-ceti', name: 'Tau Ceti', simbad: 'Tau Ceti', raDeg: 26.017013, decDeg: -15.937480, parallaxMas: 273.8097, color: 0xffca93, labelIn: 'none' },
  { id: 'altair', name: 'Altair', simbad: 'Altair', raDeg: 297.695827, decDeg: 8.868321, parallaxMas: 194.95, color: 0xd8e8ff, labelIn: 'neighborhood' },
  { id: 'vega', name: 'Vega', simbad: 'Vega', raDeg: 279.234735, decDeg: 38.783689, parallaxMas: 130.23, color: 0xd8e8ff, labelIn: 'neighborhood' },
  { id: 'fomalhaut', name: 'Fomalhaut', simbad: 'Fomalhaut', raDeg: 344.412693, decDeg: -29.622237, parallaxMas: 129.81, color: 0xe4edff, labelIn: 'neighborhood' },
  { id: 'pollux', name: 'Pollux', simbad: 'Pollux', raDeg: 116.328958, decDeg: 28.026199, parallaxMas: 96.54, color: 0xffbd87, labelIn: 'neighborhood' },
  { id: 'denebola', name: 'Denebola', simbad: 'Denebola', raDeg: 177.264910, decDeg: 14.572058, parallaxMas: 90.91, color: 0xe5eeff, labelIn: 'none' },
  { id: 'arcturus', name: 'Arcturus', simbad: 'Arcturus', raDeg: 213.915300, decDeg: 19.182409, parallaxMas: 88.83, color: 0xffc087, labelIn: 'neighborhood' },
  { id: 'capella', name: 'Capella', simbad: 'Capella', raDeg: 79.172328, decDeg: 45.997991, parallaxMas: 76.20, color: 0xffe2a6, labelIn: 'neighborhood' },
] as const;

export type NearbyStar = typeof NEARBY_STARS[number];

export const STELLAR_DATA_SOURCE = {
  name: 'SIMBAD Astronomical Database',
  url: 'https://simbad.cds.unistra.fr/simbad/',
  retrieved: '2026-11-06',
} as const;
