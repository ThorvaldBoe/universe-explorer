import * as THREE from 'three';
import {
  LOCAL_GROUP_GALAXIES, LOCAL_GROUP_SUN_POSITION_LY,
} from '../data/local-group';
import { GALACTIC_CENTER_POSITION_KM } from '../data/milky-way';
import { LIGHT_YEAR_KM } from '../data/stellar-neighborhood';
import type { SceneRenderer, SceneUpdateContext } from './types';

type GalaxyLabel = { element: HTMLSpanElement; positionLy: THREE.Vector3; offset: [number, number] };

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
}

function markerGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const context = canvas.getContext('2d')!;
  const glow = context.createRadialGradient(32, 32, 1, 32, 32, 32);
  glow.addColorStop(0, 'rgba(255,255,255,.65)');
  glow.addColorStop(.3, 'rgba(255,255,255,.28)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function galaxyPoints(positionLy: [number, number, number], diameterLy: number, colorValue: number, seed: number, armsCount: number) {
  const random = seeded(seed);
  const radius = diameterLy / 2;
  const positions: number[] = [];
  const colors: number[] = [];
  const base = new THREE.Color(colorValue);
  for (let i = 0; i < 3_200; i++) {
    const r = radius * Math.pow(random(), 1.25);
    const arm = Math.floor(random() * armsCount);
    const angle = Math.log(Math.max(r, radius * .04) / (radius * .22)) / Math.tan(12 * Math.PI / 180)
      + arm * Math.PI * 2 / armsCount + (random() - .5) * .8;
    const spread = (random() - .5) * radius * .055;
    const x = Math.cos(angle) * r - Math.sin(angle) * spread;
    const y = Math.sin(angle) * r + Math.cos(angle) * spread;
    const z = (random() - .5) * radius * .03;
    positions.push(x, y, z);
    const tint = base.clone().multiplyScalar(.62 + random() * .65);
    colors.push(tint.r, tint.g, tint.b);
  }
  const diskGeometry = new THREE.BufferGeometry();
  diskGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  diskGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const disk = new THREE.Points(diskGeometry, new THREE.PointsMaterial({
    size: 1.45, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .84, depthWrite: false,
  }));
  disk.frustumCulled = false;
  disk.position.set(...positionLy);
  return disk;
}

function makeLabel(text: string, id: string, className: string) {
  const element = document.createElement('span');
  element.className = `stellar-label ${className}`;
  element.textContent = text;
  element.dataset.localGroupId = id;
  element.hidden = true;
  return element;
}

function opacity(object: THREE.Object3D, value: number) {
  const material = (object as THREE.Points).material;
  if (Array.isArray(material)) material.forEach((item) => { item.opacity = value; });
  else material.opacity = value;
}

export const localGroupRenderer: SceneRenderer = {
  kind: 'local-group',
  cameraDistance: 1,
  create() {
    const group = new THREE.Group();
    const disks = LOCAL_GROUP_GALAXIES.map((galaxy) => {
      const disk = galaxyPoints(
        [...galaxy.positionLy] as [number, number, number], galaxy.diameterLy, galaxy.color, galaxy.seed, galaxy.armCount,
      );
      disk.rotation.x = galaxy.displayTiltDegrees * Math.PI / 180;
      disk.name = `galaxy-${galaxy.id}-reconstructed-disk`;
      group.add(disk);
      return disk;
    });

    const galaxyPositions = LOCAL_GROUP_GALAXIES.map((galaxy) => galaxy.positionLy).flat();
    const galaxyColors = LOCAL_GROUP_GALAXIES.flatMap((galaxy) => {
      const color = new THREE.Color(galaxy.color);
      return [color.r, color.g, color.b];
    });
    const markerGeometry = new THREE.BufferGeometry();
    markerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(galaxyPositions, 3));
    markerGeometry.setAttribute('color', new THREE.Float32BufferAttribute(galaxyColors, 3));
    const markers = new THREE.Points(markerGeometry, new THREE.PointsMaterial({
      size: 9, sizeAttenuation: false, vertexColors: true, map: markerGlowTexture(), alphaTest: .01,
      transparent: true, opacity: 1, depthWrite: false,
    }));
    markers.name = 'enhanced-local-group-galaxy-markers';
    markers.frustumCulled = false;
    group.add(markers);

    const glowGeometry = new THREE.BufferGeometry();
    glowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(galaxyPositions, 3));
    glowGeometry.setAttribute('color', new THREE.Float32BufferAttribute(galaxyColors, 3));
    const galaxyGlows = new THREE.Points(glowGeometry, new THREE.PointsMaterial({
      size: 28, sizeAttenuation: false, vertexColors: true, map: markerGlowTexture(), alphaTest: .01, transparent: true, opacity: .2,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    galaxyGlows.name = 'enhanced-galaxy-marker-glows';
    galaxyGlows.frustumCulled = false;
    group.add(galaxyGlows);

    const sunGeometry = new THREE.BufferGeometry();
    sunGeometry.setAttribute('position', new THREE.Float32BufferAttribute(LOCAL_GROUP_SUN_POSITION_LY, 3));
    sunGeometry.setAttribute('color', new THREE.Float32BufferAttribute([1, .82, .49], 3));
    const sunMarker = new THREE.Points(sunGeometry, new THREE.PointsMaterial({
      size: 4, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 1, depthWrite: false,
    }));
    sunMarker.name = 'enhanced-sun-position';
    sunMarker.frustumCulled = false;
    group.add(sunMarker);

    const satelliteRandom = seeded(20261108);
    const satellites: number[] = [];
    const satelliteColors: number[] = [];
    for (const host of [LOCAL_GROUP_GALAXIES[0], LOCAL_GROUP_GALAXIES[1]]) {
      for (let i = 0; i < 24; i++) {
        const angle = satelliteRandom() * Math.PI * 2;
        const radius = 75_000 + satelliteRandom() * 220_000;
        satellites.push(
          host.positionLy[0] + Math.cos(angle) * radius,
          host.positionLy[1] + Math.sin(angle) * radius,
          host.positionLy[2] + (satelliteRandom() - .5) * radius * .8,
        );
        satelliteColors.push(.52, .69, .91);
      }
    }
    const satelliteGeometry = new THREE.BufferGeometry();
    satelliteGeometry.setAttribute('position', new THREE.Float32BufferAttribute(satellites, 3));
    satelliteGeometry.setAttribute('color', new THREE.Float32BufferAttribute(satelliteColors, 3));
    const satelliteField = new THREE.Points(satelliteGeometry, new THREE.PointsMaterial({
      size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .45, depthWrite: false,
    }));
    satelliteField.name = 'illustrative-dwarf-satellite-field';
    satelliteField.frustumCulled = false;
    group.add(satelliteField);

    const labelLayer = document.createElement('div');
    labelLayer.className = 'stellar-label-layer';
    labelLayer.setAttribute('aria-hidden', 'true');
    const labels: GalaxyLabel[] = [
      { element: makeLabel('MILKY WAY · HOME', 'milky-way', 'stellar-label-region'), positionLy: new THREE.Vector3(...LOCAL_GROUP_GALAXIES[0].positionLy), offset: [-46, -24] },
      { element: makeLabel('ANDROMEDA · M31', 'andromeda', ''), positionLy: new THREE.Vector3(...LOCAL_GROUP_GALAXIES[1].positionLy), offset: [-76, -38] },
      { element: makeLabel('TRIANGULUM · M33', 'triangulum', 'stellar-label-region'), positionLy: new THREE.Vector3(...LOCAL_GROUP_GALAXIES[2].positionLy), offset: [70, 50] },
    ];
    labels.forEach(({ element }) => labelLayer.append(element));
    document.querySelector('.scene-wrap')?.append(labelLayer);

    group.scale.setScalar(LIGHT_YEAR_KM);
    group.position.set(...GALACTIC_CENTER_POSITION_KM);
    group.userData.worldPosition = group.position.clone();
    group.userData.disks = disks;
    group.userData.markers = markers;
    group.userData.glows = galaxyGlows;
    group.userData.sunMarker = sunMarker;
    group.userData.satellites = satelliteField;
    group.userData.labels = labels;
    group.userData.labelLayer = labelLayer;
    return group;
  },
  update(group, _elapsed, context?: SceneUpdateContext) {
    if (!context) return;
    const entering = context.transitionFromRenderer === 'galactic' && context.transitionToRenderer === 'local-group';
    const leaving = context.transitionFromRenderer === 'local-group' && context.transitionToRenderer !== 'local-group';
    const active = context.activeRenderer === 'local-group';
    const progress = context.transitionProgress ?? 1;
    group.visible = active || entering || leaving;
    const transitionOpacity = entering
      ? THREE.MathUtils.smoothstep(progress, .08, .72)
      : leaving ? 1 - THREE.MathUtils.smoothstep(progress, .28, .88) : active ? 1 : 0;
    const widthLy = (context.visibleWidthKm ?? LIGHT_YEAR_KM * 10_000_000) / LIGHT_YEAR_KM;
    const groupReveal = THREE.MathUtils.smoothstep(widthLy, 300_000, 1_500_000);
    const opacityValue = transitionOpacity * groupReveal;
    (group.userData.disks as THREE.Points[]).forEach((disk, index) => {
      opacity(disk, opacityValue * (index === 0 ? .78 : index === 1 ? .94 : .7));
    });
    opacity(group.userData.markers as THREE.Points, opacityValue);
    opacity(group.userData.glows as THREE.Points, opacityValue * .65);
    opacity(group.userData.sunMarker as THREE.Points, opacityValue);
    opacity(group.userData.satellites as THREE.Points, opacityValue * THREE.MathUtils.smoothstep(widthLy, 1_000_000, 3_500_000));

    const layer = group.userData.labelLayer as HTMLDivElement;
    layer.hidden = !group.visible;
    const camera = context.camera;
    const width = context.viewportWidth ?? 1280;
    const height = context.viewportHeight ?? 720;
    const labels = group.userData.labels as GalaxyLabel[];
    labels.forEach((item) => {
      const minWidth = item.element.dataset.localGroupId === 'triangulum' ? 2_400_000 : 1_300_000;
      if (!camera || !group.visible || widthLy < minWidth || opacityValue <= .01) {
        item.element.hidden = true;
        return;
      }
      const point = item.positionLy.clone().multiplyScalar(LIGHT_YEAR_KM).add(group.position).project(camera);
      const x = (point.x * .5 + .5) * width + item.offset[0] * Math.min(1, width / 700);
      const y = (-point.y * .5 + .5) * height + item.offset[1] * Math.min(1, width / 700);
      const inFrame = point.z >= -1 && point.z <= 1 && x > 4 && x < width - 4 && y > 65 && y < height - 4;
      item.element.hidden = !inFrame;
      if (!inFrame) return;
      item.element.style.left = `${x}px`;
      item.element.style.top = `${y}px`;
      item.element.style.opacity = String(opacityValue);
    });
  },
};
