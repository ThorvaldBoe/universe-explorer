import type { Stop } from '../types';

export const stops: Stop[] = [
  {
    id: 'earth',
    chapter: '01 · Earth',
    title: 'Home',
    introduction: 'A blue world, suspended in the dark. This is where every journey begins.',
    visibleWidthMeters: 12_742_000,
    scaleLabel: 'Earth · 12,742 km across',
    renderer: 'planetary',
    provenance: 'illustrative',
  },
  {
    id: 'solar-system',
    chapter: '02 · Solar System',
    title: 'Our neighborhood',
    introduction: 'The planets are worlds apart. At true distance, even the giant Sun becomes a point in a great emptiness.',
    visibleWidthMeters: 9.0e12,
    scaleLabel: 'Planetary system · ~60 AU across',
    renderer: 'planetary',
    provenance: 'illustrative',
  },
  {
    id: 'milky-way',
    chapter: '03 · Galaxy',
    title: 'A home among stars',
    introduction: 'Our Solar System is one small part of a barred spiral galaxy. This outside view is a reconstruction.',
    visibleWidthMeters: 1.42e21,
    scaleLabel: 'Milky Way · ~150,000 light-years wide',
    renderer: 'galactic',
    provenance: 'reconstructed',
  },
  {
    id: 'cosmic-web',
    chapter: '04 · Cosmic structure',
    title: 'The cosmic web',
    introduction: 'Galaxies gather along vast filaments around immense voids. This visualization is a model, not a complete map.',
    visibleWidthMeters: 1.89e25,
    scaleLabel: 'Large-scale structure · illustrative view',
    renderer: 'cosmological',
    provenance: 'illustrative',
  },
];
