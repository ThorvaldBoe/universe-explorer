import * as THREE from 'three';
import { GALACTIC_CENTER_FROM_SUN_LY, MILKY_WAY_MODEL } from '../data/milky-way';
import { LIGHT_YEAR_KM, SUN_ANCHOR_KM } from '../data/stellar-neighborhood';
import type { SceneRenderer, SceneUpdateContext } from './types';

type OverlayLabel = { element: HTMLSpanElement; positionLy: THREE.Vector3; offset: [number, number] };

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
}

function gaussian(random: () => number) {
  return Math.sqrt(-2 * Math.log(Math.max(.00001, random()))) * Math.cos(Math.PI * 2 * random());
}

function colorFor(random: () => number, radiusLy: number) {
  const color = new THREE.Color();
  const inner = THREE.MathUtils.smoothstep(radiusLy, 8_000, 42_000);
  const hue = inner > .5 ? .58 + random() * .12 : .07 + random() * .1;
  color.setHSL(hue, .56 + random() * .3, .57 + random() * .3);
  return color;
}

function pointsField(positions: number[], colors: number[], size: number, opacity: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({
    size, sizeAttenuation: false, vertexColors: true, transparent: true, opacity, depthWrite: false,
  }));
  points.frustumCulled = false;
  return points;
}

function addDisk(group: THREE.Group, random: () => number) {
  const centerX = GALACTIC_CENTER_FROM_SUN_LY[0];
  const centerY = GALACTIC_CENTER_FROM_SUN_LY[1];
  const diskPositions: number[] = [], diskColors: number[] = [];
  for (let i = 0; i < 16_000; i++) {
    const radius = MILKY_WAY_MODEL.diskModelRadiusLy * Math.pow(random(), 1.28);
    const angle = random() * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const z = gaussian(random) * MILKY_WAY_MODEL.diskThicknessLy * .18;
    diskPositions.push(x, y, z);
    const color = colorFor(random, radius);
    diskColors.push(color.r, color.g, color.b);
  }
  const disk = pointsField(diskPositions, diskColors, 1.15, .52);
  disk.name = 'modeled-galactic-disk'; group.add(disk);

  const pitch = MILKY_WAY_MODEL.spiralPitchDegrees * Math.PI / 180;
  const armPositions: number[] = [], armColors: number[] = [];
  for (let i = 0; i < 16_000; i++) {
    const radius = MILKY_WAY_MODEL.armStartRadiusLy + Math.pow(random(), .78) * (MILKY_WAY_MODEL.diskModelRadiusLy - MILKY_WAY_MODEL.armStartRadiusLy);
    const arm = Math.floor(random() * MILKY_WAY_MODEL.mainArmCount);
    const angle = -.5 * Math.PI + .34 + Math.log(radius / 26_000) / Math.tan(pitch) + arm * Math.PI * 2 / MILKY_WAY_MODEL.mainArmCount;
    const spread = gaussian(random) * (260 + radius * .008);
    const x = centerX + Math.cos(angle) * radius - Math.sin(angle) * spread;
    const y = centerY + Math.sin(angle) * radius + Math.cos(angle) * spread;
    const z = gaussian(random) * 170;
    armPositions.push(x, y, z);
    const color = colorFor(random, radius);
    armColors.push(color.r, color.g, color.b);
  }
  const arms = pointsField(armPositions, armColors, 1.4, .94);
  arms.name = 'modeled-spiral-arm-density'; group.add(arms);

  const spurPositions: number[] = [], spurColors: number[] = [];
  for (let i = 0; i < 5_000; i++) {
    const x = (random() - .5) * MILKY_WAY_MODEL.localSpurHalfLengthLy * 2;
    const y = .18 * x + Math.sin(x / 900) * 360 + gaussian(random) * 250;
    const z = gaussian(random) * 160;
    spurPositions.push(x, y, z);
    const color = new THREE.Color().setHSL(.56 + random() * .1, .58, .67 + random() * .25);
    spurColors.push(color.r, color.g, color.b);
  }
  const spur = pointsField(spurPositions, spurColors, 1.35, .75);
  spur.name = 'reconstructed-orion-spur'; group.add(spur);

  const haloPositions: number[] = [], haloColors: number[] = [];
  for (let i = 0; i < 3_200; i++) {
    const azimuth = random() * Math.PI * 2;
    const vertical = random() * 2 - 1;
    const planar = Math.sqrt(1 - vertical * vertical);
    const radius = 18_000 + random() * (MILKY_WAY_MODEL.haloModelRadiusLy - 18_000);
    const x = centerX + Math.cos(azimuth) * planar * radius;
    const y = centerY + Math.sin(azimuth) * planar * radius;
    const z = vertical * radius * .42;
    haloPositions.push(x, y, z);
    const color = new THREE.Color().setHSL(.58 + random() * .1, .35, .65 + random() * .28);
    haloColors.push(color.r, color.g, color.b);
  }
  const halo = pointsField(haloPositions, haloColors, 1.05, .2);
  halo.name = 'illustrative-galactic-halo'; group.add(halo);

  const barGeometry = new THREE.SphereGeometry(1, 40, 28);
  const bar = new THREE.Mesh(barGeometry, new THREE.MeshBasicMaterial({ color: 0xffbe78, transparent: true, opacity: .38, depthWrite: false }));
  bar.position.set(centerX, centerY, 0);
  bar.scale.set(MILKY_WAY_MODEL.barHalfLengthLy, MILKY_WAY_MODEL.barHalfWidthLy, 1_150);
  bar.name = 'illustrative-central-bar'; group.add(bar);

  const bulgeGeometry = new THREE.SphereGeometry(1, 40, 28);
  const bulge = new THREE.Mesh(bulgeGeometry, new THREE.MeshBasicMaterial({ color: 0xffd5a0, transparent: true, opacity: .22, depthWrite: false }));
  bulge.position.set(centerX, centerY, 0);
  bulge.scale.set(MILKY_WAY_MODEL.bulgeRadiusLy, MILKY_WAY_MODEL.bulgeRadiusLy * .7, MILKY_WAY_MODEL.bulgeRadiusLy * .28);
  bulge.name = 'illustrative-galactic-bulge'; group.add(bulge);

  group.userData.disk = disk;
  group.userData.arms = arms;
  group.userData.spur = spur;
  group.userData.halo = halo;
  group.userData.bar = bar;
  group.userData.bulge = bulge;
}

function label(text: string, id: string, className: string): HTMLSpanElement {
  const element = document.createElement('span');
  element.className = `stellar-label ${className}`;
  element.textContent = text;
  element.dataset.galaxyLabel = id;
  element.hidden = true;
  return element;
}

function materialOpacity(object: THREE.Object3D, opacity: number) {
  const material = (object as THREE.Mesh | THREE.Points).material;
  if (Array.isArray(material)) material.forEach((item) => { item.opacity = opacity; });
  else material.opacity = opacity;
}

export const galacticRenderer: SceneRenderer = {
  kind: 'galactic',
  cameraDistance: 1,
  create() {
    const group = new THREE.Group();
    const random = seeded(MILKY_WAY_MODEL.seed);
    addDisk(group, random);

    const markers = pointsField(
      [0, 0, 0, ...GALACTIC_CENTER_FROM_SUN_LY],
      [1, .77, .42, 1, .55, .27],
      7,
      1,
    );
    markers.name = 'enhanced-sun-and-galactic-center-markers';
    group.add(markers);

    const labelLayer = document.createElement('div');
    labelLayer.className = 'stellar-label-layer';
    labelLayer.setAttribute('aria-hidden', 'true');
    const labels: OverlayLabel[] = [
      { element: label('SUN · ORION SPUR', 'sun', 'stellar-label-sun'), positionLy: new THREE.Vector3(0, 0, 0), offset: [-74, 30] },
      { element: label('GALACTIC CENTER', 'galactic-center', ''), positionLy: new THREE.Vector3(...GALACTIC_CENTER_FROM_SUN_LY), offset: [78, -22] },
      { element: label('ORION SPUR · RECONSTRUCTED', 'orion-spur', 'stellar-label-region'), positionLy: new THREE.Vector3(-3_800, -480, 0), offset: [-18, -34] },
    ];
    labels.forEach(({ element }) => labelLayer.append(element));
    document.querySelector('.scene-wrap')?.append(labelLayer);

    group.scale.setScalar(LIGHT_YEAR_KM);
    group.position.set(...SUN_ANCHOR_KM);
    group.userData.worldPosition = group.position.clone();
    group.userData.labelLayer = labelLayer;
    group.userData.labels = labels;
    return group;
  },
  update(group, _elapsed, context?: SceneUpdateContext) {
    if (!context) return;
    const transitioningIn = context.transitionFromRenderer === 'stellar' && context.transitionToRenderer === 'galactic';
    const transitioningOut = context.transitionFromRenderer === 'galactic' && context.transitionToRenderer === 'stellar';
    const enteringFromLocalGroup = context.transitionFromRenderer === 'local-group' && context.transitionToRenderer === 'galactic';
    const leavingGalaxy = context.transitionFromRenderer === 'galactic' && context.transitionToRenderer !== 'galactic';
    const inTransition = transitioningIn || enteringFromLocalGroup || leavingGalaxy;
    const progress = context.transitionProgress ?? 1;
    const widthLy = (context.visibleWidthKm ?? LIGHT_YEAR_KM * 150_000) / LIGHT_YEAR_KM;
    const active = context.activeRenderer === 'galactic';
    group.visible = active || inTransition;
    const transitionOpacity = transitioningIn
      ? THREE.MathUtils.smoothstep(progress, .15, .8)
      : enteringFromLocalGroup ? THREE.MathUtils.smoothstep(progress, .12, .72)
      : transitioningOut ? 1 - THREE.MathUtils.smoothstep(progress, .2, .72)
        : leavingGalaxy ? 1 - THREE.MathUtils.smoothstep(progress, .35, .68) : active ? 1 : 0;
    const labelTransitionOpacity = transitioningIn
      ? THREE.MathUtils.smoothstep(progress, .42, .72)
      : leavingGalaxy ? 1 - THREE.MathUtils.smoothstep(progress, .2, .5) : transitionOpacity;
    const localReveal = THREE.MathUtils.smoothstep(widthLy, 8_000, 30_000);
    const diskReveal = THREE.MathUtils.smoothstep(widthLy, 12_000, 50_000);
    const coreReveal = THREE.MathUtils.smoothstep(widthLy, 25_000, 90_000);
    const haloReveal = THREE.MathUtils.smoothstep(widthLy, 65_000, 150_000);

    materialOpacity(group.userData.spur as THREE.Points, .75 * transitionOpacity * (1 - THREE.MathUtils.smoothstep(widthLy, 18_000, 60_000)));
    materialOpacity(group.userData.disk as THREE.Points, .52 * transitionOpacity * diskReveal);
    materialOpacity(group.userData.arms as THREE.Points, .94 * transitionOpacity * diskReveal);
    materialOpacity(group.userData.bar as THREE.Mesh, .38 * transitionOpacity * coreReveal);
    materialOpacity(group.userData.bulge as THREE.Mesh, .22 * transitionOpacity * coreReveal);
    materialOpacity(group.userData.halo as THREE.Points, .2 * transitionOpacity * haloReveal);
    materialOpacity(group.children.find((child) => child.name === 'enhanced-sun-and-galactic-center-markers') as THREE.Points, transitionOpacity);

    const width = context.viewportWidth ?? 1280;
    const height = context.viewportHeight ?? 720;
    const camera = context.camera;
    const labelLayer = group.userData.labelLayer as HTMLDivElement;
    labelLayer.hidden = !group.visible;
    for (const item of group.userData.labels as OverlayLabel[]) {
      const baseVisible = item.element.dataset.galaxyLabel === 'sun'
        ? widthLy >= 8_000
        : item.element.dataset.galaxyLabel === 'orion-spur'
          ? widthLy < 42_000
          : widthLy >= 24_000;
      if (!baseVisible || !camera || !group.visible || labelTransitionOpacity <= .01) {
        item.element.hidden = true;
        continue;
      }
      const point = item.positionLy.clone().multiplyScalar(LIGHT_YEAR_KM).add(group.position).project(camera);
      const x = (point.x * .5 + .5) * width + item.offset[0] * Math.min(1, width / 700);
      const y = (-point.y * .5 + .5) * height + item.offset[1] * Math.min(1, width / 700);
      const inFrame = point.z >= -1 && point.z <= 1 && x > 4 && x < width - 4 && y > 65 && y < height - 4;
      item.element.hidden = !inFrame;
      if (!inFrame) continue;
      item.element.style.left = `${x}px`;
      item.element.style.top = `${y}px`;
      item.element.style.opacity = String(labelTransitionOpacity * (item.element.dataset.galaxyLabel === 'orion-spur' ? localReveal : item.element.dataset.galaxyLabel === 'galactic-center' ? coreReveal : 1));
    }
  },
};
