import * as THREE from 'three';
import {
  ASTRONOMICAL_UNIT_KM, EARTH_MOON_DISTANCE_KM, EARTH_RADIUS_KM,
  MOON_RADIUS_KM, PLANETS, PLUTO, SUN_RADIUS_KM,
} from '../data/solar-system';
import type { SceneRenderer, SceneUpdateContext } from './types';

const SUN_POSITION = new THREE.Vector3(-ASTRONOMICAL_UNIT_KM, 0, 0);
type PlanetSpec = typeof PLANETS[number];

type LabelEntry = { sprite: THREE.Sprite; position: THREE.Vector3; name: string };

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
}

function canvasTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function moonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const context = canvas.getContext('2d')!;
  const random = seeded(8714);
  context.fillStyle = '#9a9893'; context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 520; i++) {
    const x = random() * canvas.width, y = random() * canvas.height;
    const radius = 1 + random() * 25;
    for (const wrappedX of [x - canvas.width, x, x + canvas.width]) {
      const crater = context.createRadialGradient(wrappedX, y, radius * .12, wrappedX, y, radius);
      crater.addColorStop(0, 'rgba(55,54,52,.68)'); crater.addColorStop(.72, 'rgba(84,83,80,.42)');
      crater.addColorStop(.87, 'rgba(211,208,201,.58)'); crater.addColorStop(1, 'rgba(110,108,103,.08)');
      context.fillStyle = crater; context.beginPath(); context.arc(wrappedX, y, radius, 0, Math.PI * 2); context.fill();
    }
  }
  return canvasTexture(canvas);
}

function sunTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const context = canvas.getContext('2d')!;
  const random = seeded(9301);
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#ffb348'); gradient.addColorStop(.5, '#ffe08a'); gradient.addColorStop(1, '#f58a32');
  context.fillStyle = gradient; context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 13_000; i++) {
    const x = random() * canvas.width, y = random() * canvas.height;
    const radius = .5 + random() * 3.5;
    context.fillStyle = random() > .5 ? 'rgba(255,246,177,.15)' : 'rgba(209,71,28,.11)';
    context.beginPath(); context.ellipse(x, y, radius * 2.4, radius, random() * Math.PI, 0, Math.PI * 2); context.fill();
  }
  return canvasTexture(canvas);
}

function textLabel(text: string, color = '#eff5ff') {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const context = canvas.getContext('2d')!;
  context.fillStyle = 'rgba(5,12,25,.80)';
  context.beginPath(); context.roundRect(3, 3, 506, 122, 28); context.fill();
  context.strokeStyle = 'rgba(145,183,235,.48)'; context.lineWidth = 3;
  context.beginPath(); context.roundRect(3, 3, 506, 122, 28); context.stroke();
  context.font = '600 48px system-ui, sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle';
  context.fillStyle = color; context.fillText(text, 256, 65, 470);
  const material = new THREE.SpriteMaterial({ map: canvasTexture(canvas), transparent: true, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 12;
  return sprite;
}

function positionForPlanet(planet: PlanetSpec) {
  const distance = planet.au * ASTRONOMICAL_UNIT_KM;
  return new THREE.Vector3(
    SUN_POSITION.x + Math.cos(planet.angle) * distance,
    Math.sin(planet.angle) * distance,
    0,
  );
}

function addOrbit(group: THREE.Group, radius: number, opacity = .16) {
  const positions = new Float32Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const angle = i / 256 * Math.PI * 2;
    positions[i * 3] = SUN_POSITION.x + Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = 0;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const orbit = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: 0x9aaecb, transparent: true, opacity, depthWrite: false }));
  group.add(orbit);
  return orbit;
}

function addOuterBodies(group: THREE.Group, random: () => number) {
  const kuiperPositions: number[] = [];
  for (let i = 0; i < 1400; i++) {
    const radius = (30 + random() * 20) * ASTRONOMICAL_UNIT_KM;
    const angle = random() * Math.PI * 2;
    kuiperPositions.push(
      SUN_POSITION.x + Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      (random() - .5) * .12 * radius,
    );
  }
  const kuiperGeometry = new THREE.BufferGeometry();
  kuiperGeometry.setAttribute('position', new THREE.Float32BufferAttribute(kuiperPositions, 3));
  group.add(new THREE.Points(kuiperGeometry, new THREE.PointsMaterial({ color: 0xaec9ed, size: 1.25, sizeAttenuation: false, transparent: true, opacity: .55, depthWrite: false })));

  const oortPositions: number[] = [];
  for (let i = 0; i < 12_000; i++) {
    const z = random() * 2 - 1;
    const angle = random() * Math.PI * 2;
    const shellFactor = Math.cbrt(.01 + random() * .99);
    const radius = (2000 + shellFactor * 98_000) * ASTRONOMICAL_UNIT_KM;
    const planar = Math.sqrt(1 - z * z);
    oortPositions.push(
      SUN_POSITION.x + Math.cos(angle) * planar * radius,
      z * radius,
      Math.sin(angle) * planar * radius,
    );
  }
  const oortGeometry = new THREE.BufferGeometry();
  oortGeometry.setAttribute('position', new THREE.Float32BufferAttribute(oortPositions, 3));
  group.add(new THREE.Points(oortGeometry, new THREE.PointsMaterial({ color: 0xa9c9f3, size: 2.1, sizeAttenuation: false, transparent: true, opacity: .38, depthWrite: false })));
}

export const solarSystemRenderer: SceneRenderer = {
  kind: 'solar-system',
  cameraDistance: 1,
  create() {
    const group = new THREE.Group();
    const random = seeded(2049);
    const labels: LabelEntry[] = [];
    const orbitPaths: Array<{ path: THREE.LineLoop; radiusKm: number }> = [];
    const textures: THREE.Texture[] = [moonTexture(), sunTexture()];

    const sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS_KM, 48, 32), new THREE.MeshBasicMaterial({ map: textures[1] }));
    sun.position.copy(SUN_POSITION); group.add(sun);
    const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS_KM * 1.05, 32, 24), new THREE.MeshBasicMaterial({ color: 0xffa33c, transparent: true, opacity: .14, side: THREE.BackSide, depthWrite: false }));
    sunGlow.position.copy(SUN_POSITION); group.add(sunGlow);
    const sunlight = new THREE.PointLight(0xffe0b1, 2.6, 0, 0);
    sunlight.position.copy(SUN_POSITION); group.add(sunlight);
    group.add(new THREE.AmbientLight(0x4d5e78, .18));
    labels.push({ sprite: textLabel('SUN'), position: SUN_POSITION.clone(), name: 'Sun' });

    for (const planet of PLANETS) {
      const position = positionForPlanet(planet);
      const radius = planet.radiusKm;
      orbitPaths.push({ path: addOrbit(group, planet.au * ASTRONOMICAL_UNIT_KM, planet.au > 2 ? .12 : .2), radiusKm: planet.au * ASTRONOMICAL_UNIT_KM });
      const material = planet.name === 'Earth'
        ? new THREE.MeshBasicMaterial({ color: 0xffffff, map: null })
        : new THREE.MeshStandardMaterial({ color: planet.color, roughness: .95, metalness: 0 });
      const body = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), material);
      body.position.copy(position); group.add(body);
      if (planet.name === 'Earth') {
        const earthTexture = new THREE.TextureLoader().load(new URL('textures/earth-blue-marble.jpg', document.baseURI).toString(), (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
          material.map = texture; material.needsUpdate = true;
        });
        textures.push(earthTexture);
        const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.012, 32, 24), new THREE.MeshBasicMaterial({ color: 0x68baff, transparent: true, opacity: .1, side: THREE.BackSide, depthWrite: false }));
        atmosphere.position.copy(position); group.add(atmosphere);
        const moon = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS_KM, 24, 16), new THREE.MeshStandardMaterial({ map: textures[0], roughness: 1, metalness: 0 }));
        moon.position.set(position.x + EARTH_MOON_DISTANCE_KM, position.y, position.z); group.add(moon);
        labels.push({ sprite: textLabel('EARTH'), position: position.clone(), name: 'Earth' });
        labels.push({ sprite: textLabel('MOON'), position: moon.position.clone(), name: 'Moon' });
        labels.push({ sprite: textLabel('EARTH · MOON'), position: position.clone().add(new THREE.Vector3(EARTH_MOON_DISTANCE_KM / 2, 0, 0)), name: 'Earth-Moon' });
      } else {
        labels.push({ sprite: textLabel(planet.name.toUpperCase()), position: position.clone(), name: planet.name });
      }
      if (planet.name === 'Saturn') {
        const rings = new THREE.Mesh(
          new THREE.RingGeometry(radius * 1.25, radius * 2.25, 72),
          new THREE.MeshBasicMaterial({ color: 0xb9a578, transparent: true, opacity: .72, side: THREE.DoubleSide, depthWrite: false }),
        );
        rings.position.copy(position); rings.rotation.x = Math.PI * .35; group.add(rings);
      }
    }

    // Pluto is a dwarf planet; its representative position is deliberately schematic.
    const plutoPosition = new THREE.Vector3(
      SUN_POSITION.x + Math.cos(PLUTO.angle) * PLUTO.au * ASTRONOMICAL_UNIT_KM,
      Math.sin(PLUTO.angle) * PLUTO.au * ASTRONOMICAL_UNIT_KM,
      0,
    );
    orbitPaths.push({ path: addOrbit(group, PLUTO.au * ASTRONOMICAL_UNIT_KM, .07), radiusKm: PLUTO.au * ASTRONOMICAL_UNIT_KM });
    const pluto = new THREE.Mesh(new THREE.SphereGeometry(PLUTO.radiusKm, 20, 16), new THREE.MeshStandardMaterial({ color: 0xcbbdaf, roughness: 1 }));
    pluto.position.copy(plutoPosition); group.add(pluto);
    labels.push({ sprite: textLabel('PLUTO · DWARF PLANET'), position: plutoPosition, name: 'Pluto' });
    addOuterBodies(group, random);

    const markerPositions: number[] = [];
    const markerColors: number[] = [];
    const markerColor = new THREE.Color();
    for (const planet of PLANETS) {
      const position = positionForPlanet(planet);
      markerPositions.push(position.x, position.y, position.z);
      markerColor.setHex(planet.color); markerColors.push(markerColor.r, markerColor.g, markerColor.b);
    }
    markerPositions.push(EARTH_MOON_DISTANCE_KM, 0, 0);
    markerColor.setHex(0xb7c5d8); markerColors.push(markerColor.r, markerColor.g, markerColor.b);
    markerPositions.push(plutoPosition.x, plutoPosition.y, plutoPosition.z);
    markerColor.setHex(0xcbbdaf); markerColors.push(markerColor.r, markerColor.g, markerColor.b);
    const markerGeometry = new THREE.BufferGeometry();
    markerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(markerPositions, 3));
    markerGeometry.setAttribute('color', new THREE.Float32BufferAttribute(markerColors, 3));
    group.add(new THREE.Points(markerGeometry, new THREE.PointsMaterial({ size: 4.5, sizeAttenuation: false, vertexColors: true, depthWrite: false, transparent: true, opacity: .9 })));

    for (const entry of labels) {
      const sprite = entry.sprite;
      sprite.position.copy(entry.position);
      group.add(sprite);
      entry.sprite = sprite;
    }
    group.userData.labels = labels;
    group.userData.orbitPaths = orbitPaths;
    group.userData.sharedTextures = textures;
    return group;
  },
  update(group, _elapsed, context?: SceneUpdateContext) {
    if (!context) return;
    group.visible = context.activeRenderer === 'solar-system';
    const widthKm = context.visibleWidthKm ?? 1_000_000;
    const worldPerPixel = widthKm / Math.max(1, context.viewportWidth ?? 1280);
    const labelWidth = 110 * worldPerPixel;
    const labelHeight = 32 * worldPerPixel;
    const labels = group.userData.labels as LabelEntry[];
    const orbitPaths = group.userData.orbitPaths as Array<{ path: THREE.LineLoop; radiusKm: number }>;
    const outerFrame = widthKm > 20_000_000_000;
    const wideFrame = widthKm > 500_000_000;
    const beyondNeptuneFrame = widthKm > 10_000_000_000;
    const earthMoonPair = widthKm >= 800_000;
    const verticalOffsets: Record<string, number> = {
      Sun: .035, 'Earth-Moon': .095,
      Jupiter: .12, Saturn: -.09, Uranus: -.1, Neptune: -.15, Pluto: .025,
    };
    for (const entry of labels) {
      const isEarthOrMoon = entry.name === 'Earth' || entry.name === 'Moon';
      const isInnerBody = ['Mercury', 'Venus', 'Mars', 'Earth-Moon'].includes(entry.name);
      const isOuterBody = ['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(entry.name) || (beyondNeptuneFrame && entry.name === 'Pluto');
      const isBeyondNeptuneLabel = entry.name === 'Neptune' || entry.name === 'Pluto';
      entry.sprite.visible = !outerFrame && (
        (entry.name === 'Sun') ||
        (earthMoonPair && !wideFrame && entry.name === 'Earth-Moon') ||
        (!earthMoonPair && isEarthOrMoon) ||
        (wideFrame ? (beyondNeptuneFrame ? isBeyondNeptuneLabel : isOuterBody) : isInnerBody)
      );
      entry.sprite.scale.set(labelWidth, labelHeight, 1);
      const offsetY = widthKm * (verticalOffsets[entry.name] ?? .035);
      const offsetX = entry.name === 'Sun' || entry.name === 'Earth-Moon'
        ? 0
        : -Math.sign(entry.position.x - SUN_POSITION.x) * labelWidth * .55;
      entry.sprite.position.copy(entry.position).add(new THREE.Vector3(offsetX, offsetY, 0));
    }
    for (const orbit of orbitPaths) orbit.path.visible = orbit.radiusKm <= widthKm * .5;
  },
};
