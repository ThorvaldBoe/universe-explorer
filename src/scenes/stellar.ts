import * as THREE from 'three';
import { LIGHT_YEAR_KM, NEARBY_STARS, SUN_ANCHOR_KM } from '../data/stellar-neighborhood';
import type { NearbyStar } from '../data/stellar-neighborhood';
import { rendererTransitionOpacity, type SceneRenderer, type SceneUpdateContext } from './types';

type StarLabel = { element: HTMLSpanElement; position: THREE.Vector3; id: string; name: string; labelIn: string };

function starPosition(star: NearbyStar) {
  const distanceLy = 3261.56 / star.parallaxMas;
  const ra = star.raDeg * Math.PI / 180;
  const dec = star.decDeg * Math.PI / 180;
  const planar = distanceLy * Math.cos(dec);
  return new THREE.Vector3(planar * Math.cos(ra), distanceLy * Math.sin(dec), planar * Math.sin(ra));
}

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
}

function textLabel(text: string, id: string, className = '') {
  const element = document.createElement('span');
  element.className = `stellar-label ${className}`;
  element.textContent = text;
  element.dataset.starId = id;
  element.hidden = true;
  return element;
}

function gaussian(random: () => number) {
  return Math.sqrt(-2 * Math.log(Math.max(.00001, random()))) * Math.cos(Math.PI * 2 * random());
}

function cloudTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
  const context = canvas.getContext('2d')!;
  const glow = context.createRadialGradient(64, 64, 2, 64, 64, 64);
  glow.addColorStop(0, 'rgba(164,190,255,.22)');
  glow.addColorStop(.35, 'rgba(123,146,255,.12)');
  glow.addColorStop(1, 'rgba(65,82,153,0)');
  context.fillStyle = glow; context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addLocalRegion(group: THREE.Group, random: () => number) {
  const count = 14_000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const x = (random() - .5) * 9_700;
    const onSpur = random() < .62;
    const spurCurve = .18 * x + Math.sin(x / 900) * 360;
    const y = onSpur ? spurCurve + gaussian(random) * 310 : (random() - .5) * 8_500;
    const z = gaussian(random) * (onSpur ? 110 : 220);
    positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
    const hue = random() < .28 ? .075 + random() * .05 : .56 + random() * .11;
    color.setHSL(hue, .52 + random() * .26, .56 + random() * .34);
    colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const field = new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 1.35, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .78, depthWrite: false,
  }));
  field.frustumCulled = false; group.add(field);

  const clouds = new THREE.Group();
  const texture = cloudTexture();
  const randomClouds = [
    [-2450, -740, -20, 620], [-1730, -260, 15, 470], [-1050, -180, -10, 520],
    [-280, 110, 25, 410], [620, 380, -15, 580], [1420, 530, 20, 430],
    [2310, 950, -30, 670], [3260, 1220, 10, 490],
  ];
  for (const [x, y, z, size] of randomClouds) {
    const material = new THREE.SpriteMaterial({ map: texture, color: x % 2 ? 0x7a9cff : 0xc07bff, transparent: true, opacity: .6, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y, z); sprite.scale.set(size, size * .72, 1); clouds.add(sprite);
  }
  group.add(clouds);
  group.userData.localField = field;
  group.userData.localClouds = clouds;

}

export const stellarRenderer: SceneRenderer = {
  kind: 'stellar',
  cameraDistance: 1,
  create() {
    const group = new THREE.Group();
    const scaledScene = new THREE.Group();
    const random = seeded(20_261_106);
    const points: number[] = [0, 0, 0];
    const colors: number[] = [];
    const sunColor = new THREE.Color(0xffd78a);
    colors.push(sunColor.r, sunColor.g, sunColor.b);
  const labels: StarLabel[] = [{ element: textLabel('SUN · ORIGIN', 'sun', 'stellar-label-sun'), position: new THREE.Vector3(), id: 'sun', name: 'Sun', labelIn: 'always' }];
    for (const star of NEARBY_STARS) {
      const position = starPosition(star);
      const color = new THREE.Color(star.color);
      points.push(position.x, position.y, position.z);
      colors.push(color.r, color.g, color.b);
      labels.push({ element: textLabel(star.name.toUpperCase(), star.id), position, id: star.id, name: star.name, labelIn: star.labelIn });
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const markers = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 5.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .96, depthWrite: false }));
    markers.name = 'nearby-star-markers';
    markers.frustumCulled = false; scaledScene.add(markers);

    addLocalRegion(scaledScene, random);
    scaledScene.scale.setScalar(LIGHT_YEAR_KM);
    group.add(scaledScene);
    const labelLayer = document.createElement('div');
    labelLayer.className = 'stellar-label-layer';
    labelLayer.setAttribute('aria-hidden', 'true');
    for (const label of labels) labelLayer.append(label.element);
    const localLabel = textLabel('ORION SPUR · RECONSTRUCTED', 'orion-spur', 'stellar-label-region');
    labelLayer.append(localLabel);
    document.querySelector('.scene-wrap')?.append(labelLayer);
    group.position.set(...SUN_ANCHOR_KM);
    group.userData.worldPosition = group.position.clone();
    group.userData.labels = labels;
    group.userData.markers = markers;
    group.userData.scaledScene = scaledScene;
    group.userData.localLabels = [localLabel];
    group.userData.labelLayer = labelLayer;
    return group;
  },
  update(group, _elapsed, context?: SceneUpdateContext) {
    if (!context) return;
    const widthLy = (context.visibleWidthKm ?? LIGHT_YEAR_KM * 10) / LIGHT_YEAR_KM;
    const labels = group.userData.labels as StarLabel[];
    const localRegion = widthLy >= 500;
    const localOpacity = THREE.MathUtils.smoothstep(widthLy, 500, 2_000);
    const rendererOpacity = rendererTransitionOpacity('stellar', context);
    const labelOpacity = rendererOpacity;
    group.visible = rendererOpacity > .001;
    (group.userData.labelLayer as HTMLDivElement).hidden = !group.visible;
    const scaledScene = group.userData.scaledScene as THREE.Group;
    const localField = scaledScene.userData.localField as THREE.Points;
    const localClouds = scaledScene.userData.localClouds as THREE.Group;
    localField.visible = localRegion;
    ((group.userData.markers as THREE.Points).material as THREE.PointsMaterial).opacity = .96 * rendererOpacity;
    (localField.material as THREE.PointsMaterial).opacity = .78 * localOpacity * rendererOpacity;
    localClouds.visible = localRegion;
    const camera = context.camera;
    const width = context.viewportWidth ?? 1280;
    const height = context.viewportHeight ?? 720;
    const occupiedLabels: Array<{ left: number; right: number; top: number; bottom: number }> = [];
    const placeLabel = (element: HTMLSpanElement, positionLy: THREE.Vector3, offsetPixels: [number, number], visible: boolean) => {
      if (!visible || !camera) { element.hidden = true; return; }
      const point = positionLy.clone().multiplyScalar(LIGHT_YEAR_KM).add(group.position).project(camera);
      const inFrame = point.z >= -1 && point.z <= 1 && Math.abs(point.x) <= 1.05 && Math.abs(point.y) <= 1.05;
      element.hidden = !inFrame;
      if (inFrame) {
        const anchorX = (point.x * .5 + .5) * width;
        const anchorY = (-point.y * .5 + .5) * height;
        const boxWidth = Math.min(180, element.textContent!.length * 5.5 + 22);
        const boxHeight = 28;
        const safeTop = 72;
        const candidates: Array<[number, number]> = [[...offsetPixels]];
        for (let radius = 36; radius <= 216; radius += 36) {
          for (let step = 0; step < 8; step++) {
            const angle = step * Math.PI / 4;
            candidates.push([offsetPixels[0] + Math.cos(angle) * radius, offsetPixels[1] + Math.sin(angle) * radius]);
          }
        }
        const safeLeft = width >= 600 ? 128 : 4;
        let selected: { x: number; y: number; overlap: number } | undefined;
        for (const [dx, dy] of candidates) {
          const x = anchorX + dx; const y = anchorY + dy;
          const rect = { left: x - boxWidth / 2, right: x + boxWidth / 2, top: y - boxHeight / 2, bottom: y + boxHeight / 2 };
          if (rect.left < safeLeft || rect.right > width - 4 || rect.top < safeTop || rect.bottom > height - 4) continue;
          const overlaps = occupiedLabels.filter((other) => rect.left < other.right + 6 && rect.right + 6 > other.left && rect.top < other.bottom + 6 && rect.bottom + 6 > other.top).length;
          if (overlaps === 0) { selected = { x, y, overlap: 0 }; break; }
          if (!selected || overlaps < selected.overlap) selected = { x, y, overlap: overlaps };
        }
        if (!selected) { element.hidden = true; return; }
        element.style.left = `${selected.x}px`;
        element.style.top = `${selected.y}px`;
        occupiedLabels.push({ left: selected.x - boxWidth / 2, right: selected.x + boxWidth / 2, top: selected.y - boxHeight / 2, bottom: selected.y + boxHeight / 2 });
      }
    };
    const localElement = (group.userData.localLabels as HTMLSpanElement[])[0];
    placeLabel(localElement, new THREE.Vector3(2050, 1150, 0), [0, -36], localRegion);
    localElement.style.opacity = String(localOpacity * labelOpacity);
    localClouds.children.forEach((cloud) => {
      ((cloud as THREE.Sprite).material as THREE.SpriteMaterial).opacity = .6 * localOpacity * rendererOpacity;
    });
    const labelOffsets: Record<string, [number, number]> = {
      'proxima-centauri': [-58, 16], 'alpha-centauri': [45, -17],
      'barnards-star': [-105, -60], 'wolf-359': [105, 65],
      sirius: [-110, 55], procyon: [105, 105], vega: [145, -95], altair: [165, 15],
      fomalhaut: [-110, 105], pollux: [150, -145], arcturus: [125, -80], capella: [105, -115],
    };
    for (const label of labels) {
      const nearest = label.labelIn === 'nearest' && widthLy < 20;
      const neighborhood = label.labelIn === 'neighborhood' && widthLy >= 20 && widthLy < 500;
      const isVisible = label.id === 'sun' || (!localRegion && (nearest || neighborhood));
      const offsetScale = Math.min(1, width / 700);
      const offset = label.id === 'sun' ? [0, -36] as [number, number] : labelOffsets[label.id] ?? [0, 20] as [number, number];
      offset[0] *= offsetScale; offset[1] *= offsetScale;
      placeLabel(label.element, label.position, offset, isVisible);
      label.element.style.opacity = String(labelOpacity);
    }
  },
};
