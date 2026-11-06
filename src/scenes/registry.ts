import type { RendererKind } from '../types';
import type { SceneRenderer } from './types';
import { planetaryRenderer } from './planetary';
import { solarSystemRenderer } from './solar-system';
import { lunarRenderer } from './lunar';
import { galacticRenderer } from './galactic';
import { cosmicRenderer } from './cosmic';

export const sceneRenderers: Partial<Record<RendererKind, SceneRenderer>> = {
  planetary: planetaryRenderer,
  'solar-system': solarSystemRenderer,
  stellar: planetaryRenderer,
  lunar: lunarRenderer,
  galactic: galacticRenderer,
  cosmological: cosmicRenderer,
};
