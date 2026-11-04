import type { RendererKind } from '../types';
import type { SceneRenderer } from './types';
import { planetaryRenderer } from './planetary';
import { galacticRenderer } from './galactic';
import { cosmicRenderer } from './cosmic';

export const sceneRenderers: Record<RendererKind, SceneRenderer> = {
  planetary: planetaryRenderer,
  stellar: planetaryRenderer,
  galactic: galacticRenderer,
  cosmological: cosmicRenderer,
};
