export type Provenance = 'observed' | 'reconstructed' | 'illustrative' | 'speculative';
export type RendererKind = 'planetary' | 'stellar' | 'galactic' | 'cosmological';

export interface Stop {
  id: string;
  chapter: string;
  title: string;
  introduction: string;
  /** Approximate conceptual framing width; not a raw renderer coordinate. */
  visibleWidthMeters: number;
  scaleLabel: string;
  renderer: RendererKind;
  provenance: Provenance;
}
