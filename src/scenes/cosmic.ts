import * as THREE from 'three';
import { COSMIC_STRUCTURE_ANCHORS } from '../data/cosmic-structures';
import { GALACTIC_CENTER_POSITION_KM } from '../data/milky-way';
import { LIGHT_YEAR_KM } from '../data/stellar-neighborhood';
import type { SceneRenderer, SceneUpdateContext } from './types';

type Label = { element: HTMLSpanElement; positionLy: THREE.Vector3; minWidthLy: number; maxWidthLy: number; offset: [number, number] };
type FlowPath = { points: THREE.Vector3[]; color: string };
type WebPath = { points: THREE.Vector3[]; color: string; alpha: number };
type ObservablePoint = { position: THREE.Vector3; radiusRatio: number };

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
}

function makeLabel(text: string) {
  const element = document.createElement('span');
  element.className = 'stellar-label stellar-label-region cosmic-label';
  element.textContent = text;
  element.hidden = true;
  return element;
}

/** Named cluster positions use observed direction/distance anchors. Cluster haze,
 * Laniakea flow paths, and the wide cosmic web are explicitly schematic. */
export const cosmicRenderer: SceneRenderer = {
  kind: 'cosmological',
  cameraDistance: 1,
  create() {
    const group = new THREE.Group();
    const canvas = document.createElement('canvas');
    canvas.className = 'cosmic-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.querySelector('.scene-wrap')?.append(canvas);

    const anchorVectors = COSMIC_STRUCTURE_ANCHORS.map((anchor) => new THREE.Vector3(...anchor.positionLy));
    const random = seeded(20261107);
    const clusterClouds = COSMIC_STRUCTURE_ANCHORS.slice(1).flatMap((anchor) => {
      const center = new THREE.Vector3(...anchor.positionLy);
      const color = `#${anchor.color.toString(16).padStart(6, '0')}`;
      return Array.from({ length: 260 }, () => {
        const direction = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
        return { position: center.clone().addScaledVector(direction, anchor.radiusLy * Math.pow(random(), 1.7)), color };
      });
    });

    const flowPaths: FlowPath[] = [];
    const origin = anchorVectors[0];
    anchorVectors.slice(1).forEach((destination, index) => {
      const bend = new THREE.Vector3(-destination.y, destination.x, destination.z * .22).normalize()
        .multiplyScalar(destination.length() * (index === 1 ? .19 : -.12));
      const curve = new THREE.QuadraticBezierCurve3(origin.clone(), destination.clone().multiplyScalar(.5).add(bend), destination.clone());
      flowPaths.push({ points: curve.getPoints(44), color: index === 0 ? '#ffc08b' : '#78aeea' });
    });

    const nodes = [
      [-900, -260, -480], [-580, -60, -150], [-230, 140, 160], [130, -40, 500], [480, 180, 100], [850, 280, -350],
      [-700, 350, 300], [-330, 500, 550], [20, 500, -360], [390, -420, 620], [770, -250, 460], [600, -520, -420],
    ].map(([x, y, z]) => new THREE.Vector3(x * 1_000_000, y * 1_000_000, z * 1_000_000));
    const webPaths: WebPath[] = [];
    // A small set of coherent, branching filaments leaves broad voids between strands.
    // This is a visual reconstruction, not a sampled or measured galaxy catalogue.
    const edges: [number, number, [number, number, number]][] = [
      [0, 1, [0, 55, 30]], [1, 2, [20, 30, -35]], [2, 3, [45, -20, 30]], [3, 4, [15, 40, 50]], [4, 5, [-30, 25, -45]],
      [0, 6, [-30, 40, 20]], [6, 7, [45, 20, -25]], [7, 2, [25, -20, 30]], [2, 8, [-40, 50, 20]], [8, 4, [30, 25, -45]],
      [3, 9, [-20, -35, 40]], [9, 10, [25, 10, 35]], [10, 5, [-35, 40, -10]], [4, 11, [20, -30, 40]], [11, 5, [-30, 25, -20]],
    ];
    edges.forEach(([from, to, bend], index) => {
      const start = nodes[from]; const end = nodes[to];
      const midpoint = start.clone().lerp(end, .5).add(new THREE.Vector3(...bend).multiplyScalar(1_000_000));
      const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
      webPaths.push({ points: curve.getPoints(28), color: index % 5 === 0 ? '#b3a4ff' : '#76a9e8', alpha: .34 });

      // Fainter tributaries give each main filament depth and branching detail while
      // leaving broad, readable voids between the large structures.
      const tangent = end.clone().sub(start).normalize();
      const filamentLength = end.distanceTo(start);
      for (let branch = 0; branch < 2; branch++) {
        const along = .22 + random() * .56;
        const branchStart = start.clone().lerp(end, along);
        const randomDirection = new THREE.Vector3(random() - .5, random() - .5, random() - .5);
        let side = tangent.clone().cross(randomDirection).normalize();
        if (side.lengthSq() < .01) side = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
        if (branch === 1) side.negate();
        const reach = filamentLength * (.12 + random() * .16);
        const branchEnd = branchStart.clone().addScaledVector(side, reach)
          .addScaledVector(tangent, filamentLength * (random() - .5) * .18);
        const control = branchStart.clone().lerp(branchEnd, .48)
          .addScaledVector(side, reach * .34)
          .addScaledVector(tangent, reach * (random() - .5) * .3);
        const tributary = new THREE.QuadraticBezierCurve3(branchStart, control, branchEnd);
        webPaths.push({
          points: tributary.getPoints(16),
          color: branch % 2 === 0 ? '#7b9fe0' : '#9a83d5',
          alpha: .13 + random() * .09,
        });
      }
    });

    const wideWebPaths: WebPath[] = webPaths.map((path) => ({
      points: path.points.map((point) => point.clone().multiplyScalar(5)),
      color: path.color,
      alpha: path.alpha * .72,
    }));
    const wideWebNodes = nodes.map((node) => node.clone().multiplyScalar(5));
    const observableRadiusLy = 46_500_000_000;
    const observableRandom = seeded(9302026);
    const observablePoints: ObservablePoint[] = Array.from({ length: 1800 }, () => {
      const direction = new THREE.Vector3(observableRandom() * 2 - 1, observableRandom() * 2 - 1, observableRandom() * 2 - 1).normalize();
      const radiusRatio = Math.cbrt(observableRandom());
      return { position: direction.multiplyScalar(observableRadiusLy * radiusRatio), radiusRatio };
    });

    const labelLayer = document.createElement('div');
    labelLayer.className = 'stellar-label-layer cosmic-label-layer';
    labelLayer.setAttribute('aria-hidden', 'true');
    const labels: Label[] = [
      { element: makeLabel('LOCAL GROUP'), positionLy: anchorVectors[0], minWidthLy: 25_000_000, maxWidthLy: 750_000_000, offset: [42, -18] },
      { element: makeLabel('VIRGO CLUSTER · M87'), positionLy: anchorVectors[1], minWidthLy: 25_000_000, maxWidthLy: 750_000_000, offset: [0, 23] },
      { element: makeLabel('FORNAX CLUSTER'), positionLy: anchorVectors[2], minWidthLy: 45_000_000, maxWidthLy: 750_000_000, offset: [0, -22] },
      { element: makeLabel('CENTAURUS CLUSTER'), positionLy: anchorVectors[3], minWidthLy: 130_000_000, maxWidthLy: 750_000_000, offset: [0, 22] },
    ];
    labels.forEach(({ element }) => labelLayer.append(element));
    document.querySelector('.scene-wrap')?.append(labelLayer);

    group.position.set(...GALACTIC_CENTER_POSITION_KM);
    group.userData.worldPosition = group.position.clone();
    group.userData.canvas = canvas;
    group.userData.anchors = COSMIC_STRUCTURE_ANCHORS;
    group.userData.anchorVectors = anchorVectors;
    group.userData.clusterClouds = clusterClouds;
    group.userData.flowPaths = flowPaths;
    group.userData.webPaths = webPaths;
    group.userData.webNodes = nodes;
    group.userData.wideWebPaths = wideWebPaths;
    group.userData.wideWebNodes = wideWebNodes;
    group.userData.observablePoints = observablePoints;
    group.userData.observableRadiusLy = observableRadiusLy;
    group.userData.labels = labels;
    group.userData.labelLayer = labelLayer;
    return group;
  },
  update(group, _elapsed, context?: SceneUpdateContext) {
    if (!context) return;
    const entering = context.transitionToRenderer === 'cosmological' && context.transitionFromRenderer !== 'cosmological';
    const leaving = context.transitionFromRenderer === 'cosmological' && context.transitionToRenderer !== 'cosmological';
    const active = context.activeRenderer === 'cosmological';
    const progress = context.transitionProgress ?? 1;
    const transitionOpacity = entering
      ? THREE.MathUtils.smoothstep(progress, .08, .78)
      : leaving ? 1 - THREE.MathUtils.smoothstep(progress, .22, .86) : active ? 1 : 0;
    const widthLy = (context.visibleWidthKm ?? LIGHT_YEAR_KM * 100_000_000) / LIGHT_YEAR_KM;
    const clusterOpacity = transitionOpacity * THREE.MathUtils.smoothstep(widthLy, 8_000_000, 35_000_000)
      * (1 - THREE.MathUtils.smoothstep(widthLy, 1_500_000_000, 4_000_000_000));
    const flowOpacity = transitionOpacity * THREE.MathUtils.smoothstep(widthLy, 65_000_000, 250_000_000)
      * (1 - THREE.MathUtils.smoothstep(widthLy, 700_000_000, 1_100_000_000));
    const webOpacity = transitionOpacity * THREE.MathUtils.smoothstep(widthLy, 700_000_000, 1_400_000_000)
      * (1 - THREE.MathUtils.smoothstep(widthLy, 2_000_000_000, 5_000_000_000));
    const wideWebOpacity = transitionOpacity * THREE.MathUtils.smoothstep(widthLy, 2_000_000_000, 7_000_000_000)
      * (1 - THREE.MathUtils.smoothstep(widthLy, 18_000_000_000, 35_000_000_000));
    const observableOpacity = transitionOpacity * THREE.MathUtils.smoothstep(widthLy, 38_000_000_000, 65_000_000_000);
    const visible = active || entering || leaving;
    group.visible = false; // All billion-light-year artwork is rendered in camera-relative screen coordinates below.

    const canvas = group.userData.canvas as HTMLCanvasElement;
    const width = context.viewportWidth ?? canvas.clientWidth;
    const height = context.viewportHeight ?? canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
    }
    const drawing = canvas.getContext('2d');
    const labelLayer = group.userData.labelLayer as HTMLDivElement;
    labelLayer.hidden = !visible;
    if (!drawing) return;
    drawing.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawing.clearRect(0, 0, width, height);
    canvas.hidden = !visible;
    if (!visible || !context.camera) return;

    const inverseRotation = context.camera.quaternion.clone().invert();
    const cameraOffsetLy = context.cameraWorldPosition.clone().sub(new THREE.Vector3(...GALACTIC_CENTER_POSITION_KM)).multiplyScalar(1 / LIGHT_YEAR_KM);
    const focalPixels = height / (2 * Math.tan(THREE.MathUtils.degToRad((context.camera as THREE.PerspectiveCamera).fov) / 2));
    const project = (positionLy: THREE.Vector3) => {
      const cameraPoint = positionLy.clone().sub(cameraOffsetLy).applyQuaternion(inverseRotation);
      const depth = -cameraPoint.z;
      if (depth <= 0) return undefined;
      return { x: width / 2 + cameraPoint.x / depth * focalPixels, y: height / 2 - cameraPoint.y / depth * focalPixels, depth };
    };

    // Diffuse cluster hints are enhanced markers, not edges or completeness claims.
    drawing.globalAlpha = clusterOpacity * .32;
    for (const cloud of group.userData.clusterClouds as { position: THREE.Vector3; color: string }[]) {
      const point = project(cloud.position);
      if (!point || point.x < -2 || point.x > width + 2 || point.y < -2 || point.y > height + 2) continue;
      drawing.fillStyle = cloud.color;
      drawing.fillRect(point.x, point.y, 1.2, 1.2);
    }

    if (flowOpacity > .005) {
      drawing.globalAlpha = flowOpacity * .56;
      drawing.lineWidth = 1.15;
      for (const path of group.userData.flowPaths as FlowPath[]) {
        drawing.beginPath();
        let started = false;
        for (const point of path.points) {
          const screen = project(point);
          if (!screen || screen.x < -width || screen.x > width * 2 || screen.y < -height || screen.y > height * 2) { started = false; continue; }
          if (!started) { drawing.moveTo(screen.x, screen.y); started = true; }
          else drawing.lineTo(screen.x, screen.y);
        }
        drawing.strokeStyle = path.color;
        drawing.stroke();
      }
    }

    if (webOpacity > .005) {
      for (const path of group.userData.webPaths as WebPath[]) {
        drawing.globalAlpha = webOpacity * path.alpha;
        drawing.beginPath();
        let started = false;
        for (const point of path.points) {
          const screen = project(point);
          if (!screen || screen.x < -width || screen.x > width * 2 || screen.y < -height || screen.y > height * 2) { started = false; continue; }
          if (!started) { drawing.moveTo(screen.x, screen.y); started = true; }
          else drawing.lineTo(screen.x, screen.y);
        }
        drawing.strokeStyle = path.color;
        drawing.lineWidth = 3.2;
        drawing.shadowColor = path.color;
        drawing.shadowBlur = 8;
        drawing.stroke();
        drawing.shadowBlur = 0;
        drawing.lineWidth = 1.15;
        drawing.stroke();
      }
      drawing.globalAlpha = webOpacity * .36;
      for (const point of group.userData.webNodes as THREE.Vector3[] | undefined ?? []) {
        const screen = project(point);
        if (!screen || screen.x < 0 || screen.x > width || screen.y < 0 || screen.y > height) continue;
        const glow = drawing.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, 9);
        glow.addColorStop(0, 'rgba(185, 213, 255, .8)');
        glow.addColorStop(1, 'rgba(119, 160, 224, 0)');
        drawing.fillStyle = glow;
        drawing.beginPath(); drawing.arc(screen.x, screen.y, 9, 0, Math.PI * 2); drawing.fill();
      }
      drawing.globalAlpha = webOpacity * .92;
      drawing.fillStyle = '#d4e3ff';
      for (const point of group.userData.webNodes as THREE.Vector3[] | undefined ?? []) {
        const screen = project(point);
        if (screen && screen.x >= 0 && screen.x <= width && screen.y >= 0 && screen.y <= height) drawing.fillRect(screen.x - 1, screen.y - 1, 2, 2);
      }
    }

    if (wideWebOpacity > .005) {
      for (const path of group.userData.wideWebPaths as WebPath[]) {
        drawing.globalAlpha = wideWebOpacity * path.alpha;
        drawing.beginPath();
        let started = false;
        for (const point of path.points) {
          const screen = project(point);
          if (!screen || screen.x < -width || screen.x > width * 2 || screen.y < -height || screen.y > height * 2) { started = false; continue; }
          if (!started) { drawing.moveTo(screen.x, screen.y); started = true; }
          else drawing.lineTo(screen.x, screen.y);
        }
        drawing.strokeStyle = path.color;
        drawing.lineWidth = 3.5;
        drawing.shadowColor = path.color;
        drawing.shadowBlur = 9;
        drawing.stroke();
        drawing.shadowBlur = 0;
        drawing.lineWidth = 1.2;
        drawing.stroke();
      }
      drawing.globalAlpha = wideWebOpacity * .38;
      for (const point of group.userData.wideWebNodes as THREE.Vector3[]) {
        const screen = project(point);
        if (!screen || screen.x < 0 || screen.x > width || screen.y < 0 || screen.y > height) continue;
        const glow = drawing.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, 10);
        glow.addColorStop(0, 'rgba(190, 218, 255, .82)');
        glow.addColorStop(1, 'rgba(119, 160, 224, 0)');
        drawing.fillStyle = glow;
        drawing.beginPath(); drawing.arc(screen.x, screen.y, 10, 0, Math.PI * 2); drawing.fill();
      }
      drawing.globalAlpha = wideWebOpacity * .92;
      drawing.fillStyle = '#c8dcff';
      for (const point of group.userData.wideWebNodes as THREE.Vector3[]) {
        const screen = project(point);
        if (screen && screen.x >= 0 && screen.x <= width && screen.y >= 0 && screen.y <= height) drawing.fillRect(screen.x - .75, screen.y - .75, 1.5, 1.5);
      }
    }

    if (observableOpacity > .005) {
      drawing.globalAlpha = observableOpacity;
      for (const item of group.userData.observablePoints as ObservablePoint[]) {
        const screen = project(item.position);
        if (!screen || screen.x < 0 || screen.x > width || screen.y < 0 || screen.y > height) continue;
        const hue = 210 - item.radiusRatio * 185;
        drawing.fillStyle = `hsla(${hue}, 72%, 72%, ${.18 + item.radiusRatio * .45})`;
        drawing.fillRect(screen.x, screen.y, item.radiusRatio > .92 ? 1.5 : 1, item.radiusRatio > .92 ? 1.5 : 1);
      }

      const observer = project(new THREE.Vector3());
      const radiusLy = group.userData.observableRadiusLy as number;
      const cameraDistanceLy = cameraOffsetLy.length();
      if (observer && cameraDistanceLy > radiusLy) {
        const apparentRadius = focalPixels * radiusLy / Math.sqrt(cameraDistanceLy ** 2 - radiusLy ** 2);
        const horizon = drawing.createRadialGradient(observer.x, observer.y, apparentRadius * .72, observer.x, observer.y, apparentRadius);
        horizon.addColorStop(0, 'rgba(43, 71, 125, .015)');
        horizon.addColorStop(.88, 'rgba(82, 134, 207, .05)');
        horizon.addColorStop(1, 'rgba(126, 194, 255, .17)');
        drawing.fillStyle = horizon;
        drawing.beginPath(); drawing.arc(observer.x, observer.y, apparentRadius, 0, Math.PI * 2); drawing.fill();
        drawing.save();
        drawing.setLineDash([3, 7]);
        drawing.strokeStyle = 'rgba(157, 211, 255, .68)';
        drawing.lineWidth = 1.15;
        drawing.shadowColor = 'rgba(102, 182, 255, .65)';
        drawing.shadowBlur = 9;
        drawing.beginPath(); drawing.arc(observer.x, observer.y, apparentRadius, 0, Math.PI * 2); drawing.stroke();
        drawing.restore();
        drawing.textAlign = 'center';
        drawing.font = '600 10px Inter, ui-sans-serif, system-ui, sans-serif';
        const horizonLabel = 'OBSERVABLE HORIZON · ~46.5 BILLION LIGHT-YEARS RADIUS';
        const labelWidth = drawing.measureText(horizonLabel).width;
        const labelX = Math.max(labelWidth / 2 + 8, Math.min(width - labelWidth / 2 - 8, observer.x));
        const labelY = Math.min(height - 12, observer.y + apparentRadius - 18);
        drawing.fillStyle = 'rgba(4, 10, 20, .82)';
        drawing.beginPath();
        drawing.roundRect(labelX - labelWidth / 2 - 8, labelY - 12, labelWidth + 16, 22, 7);
        drawing.fill();
        drawing.fillStyle = 'rgba(204, 224, 255, .96)';
        drawing.fillText(horizonLabel, labelX, labelY + 3);
      }
    }

    drawing.globalAlpha = clusterOpacity;
    for (const [index, anchor] of COSMIC_STRUCTURE_ANCHORS.entries()) {
      const point = project(new THREE.Vector3(...anchor.positionLy));
      if (!point || point.x < -16 || point.x > width + 16 || point.y < -16 || point.y > height + 16) continue;
      const radius = index === 0 ? 3.2 : 4;
      const color = `#${anchor.color.toString(16).padStart(6, '0')}`;
      const glow = drawing.createRadialGradient(point.x, point.y, .5, point.x, point.y, radius * 3.5);
      glow.addColorStop(0, color); glow.addColorStop(1, `${color}00`);
      drawing.fillStyle = glow; drawing.beginPath(); drawing.arc(point.x, point.y, radius * 3.5, 0, Math.PI * 2); drawing.fill();
      drawing.fillStyle = color; drawing.beginPath(); drawing.arc(point.x, point.y, radius, 0, Math.PI * 2); drawing.fill();
    }

    for (const label of group.userData.labels as Label[]) {
      if (widthLy < label.minWidthLy || widthLy > label.maxWidthLy || clusterOpacity < .05) { label.element.hidden = true; continue; }
      const point = project(label.positionLy);
      const x = point ? point.x + label.offset[0] : 0;
      const y = point ? point.y + label.offset[1] : 0;
      const inFrame = point && x > 4 && x < width - 4 && y > 55 && y < height - 4;
      label.element.hidden = !inFrame;
      if (!inFrame || !point) continue;
      label.element.style.left = `${x}px`;
      label.element.style.top = `${y}px`;
      label.element.style.opacity = String(clusterOpacity);
    }
    drawing.globalAlpha = 1;
  },
};
