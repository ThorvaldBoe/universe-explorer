export type Provenance = 'observed' | 'reconstructed' | 'illustrative' | 'speculative';
export type RendererKind = 'city' | 'planetary' | 'solar-system' | 'stellar' | 'lunar' | 'galactic' | 'cosmological';

export type Vector3Tuple = [number, number, number];

export interface Stop {
  id: string;
  chapter: string;
  title: string;
  introduction: string;
  /** Approximate conceptual framing width; not a raw renderer coordinate. */
  visibleWidthMeters: number;
  /** Horizontal scene width kept in frame across viewport sizes. */
  cameraFrameWidthMeters?: number;
  scaleLabel: string;
  renderer: RendererKind;
  provenance: Provenance;
  /** Camera and scene anchors use kilometers in an Earth-centered frame. */
  cameraPositionKm?: Vector3Tuple;
  focusPositionKm?: Vector3Tuple;
  lookAtPositionKm?: Vector3Tuple;
  cameraUp?: Vector3Tuple;
  cameraFovDegrees?: number;
  scenePositionKm?: Vector3Tuple;
  sceneUp?: Vector3Tuple;
  sceneForward?: Vector3Tuple;
}
