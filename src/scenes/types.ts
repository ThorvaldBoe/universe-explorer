import type { Camera, Group, Material, Vector3 } from 'three';
import type { RendererKind, Stop } from '../types';

export interface SceneUpdateContext {
  cameraWorldPosition: Vector3;
  visibleWidthKm?: number;
  viewportWidth?: number;
  activeRenderer?: RendererKind;
  camera?: Camera;
  viewportHeight?: number;
  transitionFromRenderer?: RendererKind;
  transitionToRenderer?: RendererKind;
  transitionProgress?: number;
}

export interface SceneRenderer {
  kind: RendererKind;
  cameraDistance: number;
  create(stop: Stop): Group;
  update?(group: Group, elapsedSeconds: number, context?: SceneUpdateContext): void;
}

export function rendererTransitionOpacity(kind: RendererKind, context: SceneUpdateContext) {
  const progress = context.transitionProgress ?? 1;
  if (context.transitionToRenderer === kind && context.transitionFromRenderer !== kind) {
    return smoothstep(progress, .08, .78);
  }
  if (context.transitionFromRenderer === kind && context.transitionToRenderer !== kind) {
    return 1 - smoothstep(progress, .22, .86);
  }
  return context.activeRenderer === kind ? 1 : 0;
}

function smoothstep(value: number, edge0: number, edge1: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function applyRendererTransitionOpacity(group: Group, opacity: number) {
  group.visible = opacity > .001;
  group.traverse((object) => {
    const material = (object as { material?: unknown }).material;
    if (!material) return;
    for (const item of Array.isArray(material) ? material : [material]) {
      const candidate = item as Material;
      candidate.userData.transitionBaseOpacity ??= candidate.opacity ?? 1;
      candidate.userData.transitionBaseTransparent ??= candidate.transparent;
      candidate.userData.transitionBaseDepthWrite ??= candidate.depthWrite;
      const baseOpacity = candidate.userData.transitionBaseOpacity as number;
      candidate.opacity = baseOpacity * opacity;
      candidate.transparent = opacity < .999 || Boolean(candidate.userData.transitionBaseTransparent);
      candidate.depthWrite = opacity < .999 ? false : Boolean(candidate.userData.transitionBaseDepthWrite);
    }
  });
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
