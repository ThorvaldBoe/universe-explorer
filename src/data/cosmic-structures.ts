import { LIGHT_YEAR_METERS } from './stellar-neighborhood';

export const COSMIC_STRUCTURE_FRAMES = [
  {
    id: 'nearby-groups',
    title: 'Virgo and Nearby Groups',
    introduction: 'The Local Group sits among nearby galaxy groups and clusters. The Virgo Cluster, centered on giant galaxy M87, is about 54 million light-years away.',
    widthLy: 100_000_000,
    viewLabel: 'View width · 100 million light-years',
  },
  {
    id: 'laniakea',
    title: 'Laniakea',
    introduction: 'Our region belongs to Laniakea, a flow-defined supercluster-scale basin mapped from galaxy motions. It is not a single gravitationally bound object with a sharp physical edge.',
    widthLy: 600_000_000,
    viewLabel: 'View width · 600 million light-years',
  },
  {
    id: 'cosmic-web',
    title: 'The Cosmic Web',
    introduction: 'At billion-light-year scales, galaxy clusters trace broad filaments and sheets around immense voids. The wider network here is an illustrative reconstruction, not a complete 3D survey map.',
    widthLy: 2_000_000_000,
    viewLabel: 'View width · 2 billion light-years',
  },
  {
    id: 'large-scale-universe',
    title: 'Large-scale Universe',
    introduction: 'Across a ten-billion-light-year view, the local cosmic web sits within an immense, increasingly smooth distribution. This wide field is a scale-aware reconstruction, not a complete galaxy survey.',
    widthLy: 10_000_000_000,
    focusLy: [0, 0, 0] as [number, number, number],
    viewLabel: 'View width · 10 billion light-years',
  },
  {
    id: 'observable-universe',
    title: 'The Observable Universe',
    introduction: 'The observable universe spans about 93 billion light-years across today, although the universe is about 13.8 billion years old. The horizon marks the limit of what we can observe, not a physical wall; space may continue beyond it.',
    widthLy: 93_000_000_000,
    cameraFrameWidthLy: 120_000_000_000,
    focusLy: [0, 0, 0] as [number, number, number],
    viewLabel: 'Present-day diameter · about 93 billion light-years',
  },
] as const;

export const COSMIC_STRUCTURE_VIEW_WIDTH_METERS = COSMIC_STRUCTURE_FRAMES.map((frame) => frame.widthLy * LIGHT_YEAR_METERS);

/** Approximate J2000 directions and distance anchors; extended halos and markers are illustrative. */
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
  return [galacticY * distanceLy, -galacticX * distanceLy, galacticZ * distanceLy];
}

export const COSMIC_STRUCTURE_ANCHORS = [
  { id: 'local-group', label: 'LOCAL GROUP', distanceLy: 0, positionLy: [0, 0, 0] as [number, number, number], color: 0x9dc7ff, radiusLy: 3_500_000 },
  { id: 'virgo', label: 'VIRGO CLUSTER · M87', distanceLy: 53_800_000, positionLy: fromIcrs(187.7059, 12.3911, 53_800_000), color: 0xffc08b, radiusLy: 7_000_000 },
  { id: 'fornax', label: 'FORNAX CLUSTER', distanceLy: 62_000_000, positionLy: fromIcrs(54.621, -35.45, 62_000_000), color: 0x91d6ff, radiusLy: 5_000_000 },
  { id: 'centaurus', label: 'CENTAURUS CLUSTER', distanceLy: 170_000_000, positionLy: fromIcrs(192.203, -41.312, 170_000_000), color: 0xffa86e, radiusLy: 8_000_000 },
] as const;

export const COSMIC_STRUCTURE_SOURCES = [
  { name: 'NASA HEASARC: Virgo Cluster', url: 'https://heasarc.gsfc.nasa.gov/docs/rosat/gallery/clus_virgo.html' },
  { name: 'SIMBAD: M87 coordinates and distance reference', url: 'https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=M87' },
  { name: 'NASA Science: Fornax Cluster', url: 'https://science.nasa.gov/image-article/apod-2023-november-2-the-fornax-cluster-of-galaxies/' },
  { name: 'NASA Chandra: Centaurus Cluster', url: 'https://chandra.si.edu/photo/2002/0146/' },
  { name: 'Tully et al. 2014: The Laniakea supercluster of galaxies', url: 'https://doi.org/10.1038/nature13674' },
  { name: 'NASA Science: Large-scale structures', url: 'https://science.nasa.gov/universe/galaxies/large-scale-structures/' },
  { name: 'SDSS filament catalogue paper', url: 'https://doi.org/10.1093/mnras/stt2454' },
  { name: 'NASA: How Big Is Space? (observable universe about 92 billion light-years across)', url: 'https://www.nasa.gov/science-research/astrophysics/how-big-is-space-we-asked-a-nasa-expert-episode-61/' },
  { name: 'NASA Webb: Observable universe and early light', url: 'https://science.nasa.gov/mission/webb/big-bang-q-and-a/' },
  { name: 'NASA: Age and expansion of the universe', url: 'https://science.nasa.gov/exoplanets/what-is-the-universe/' },
] as const;
