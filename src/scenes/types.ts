import type { Group, Vector3 } from 'three';
import type { RendererKind, Stop } from '../types';

export interface SceneUpdateContext { cameraWorldPosition: Vector3; }

export interface SceneRenderer {
  kind: RendererKind;
  cameraDistance: number;
  create(stop: Stop): Group;
  update?(group: Group, elapsedSeconds: number, context?: SceneUpdateContext): void;
}

export function setOpacity(group: Group, opacity: number) {
  group.traverse((object) => {
    const material = (object as { material?: unknown }).material;
    if (!material) return;
    for (const item of Array.isArray(material) ? material : [material]) {
      const candidate = item as { transparent?: boolean; opacity?: number; depthWrite?: boolean };
      candidate.transparent = opacity < 1 || candidate.transparent === true;
      candidate.opacity = opacity;
      if (opacity < 1) candidate.depthWrite = false;
    }
  });
}
