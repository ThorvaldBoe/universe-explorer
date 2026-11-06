import type { RendererKind } from '../types';
import type { SceneRenderer } from './types';
import { planetaryRenderer } from './planetary';
import { lunarRenderer } from './lunar';
import { galacticRenderer } from './galactic';
import { cosmicRenderer } from './cosmic';

export const sceneRenderers: Partial<Record<RendererKind, SceneRenderer>> = {
  planetary: planetaryRenderer,
  stellar: planetaryRenderer,
  lunar: lunarRenderer,
  galactic: galacticRenderer,
  cosmological: cosmicRenderer,
};
