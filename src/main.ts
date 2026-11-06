import * as THREE from 'three';
import { stops } from './data/stops';
import { sceneRenderers } from './scenes/registry';
import { DeepZoomArtwork, earthZoomArtIndexByStop, earthZoomFrames } from './scenes/deep-zoom-artwork';
import type { RendererKind, Stop } from './types';
import './style.css';

const canvas = document.querySelector<HTMLCanvasElement>('#universe')!;
const sceneWrap = document.querySelector<HTMLElement>('.scene-wrap')!;
const artwork = new DeepZoomArtwork(sceneWrap);
const title = document.querySelector<HTMLElement>('#scene-title')!;
const chapter = document.querySelector<HTMLElement>('#chapter')!;
const copy = document.querySelector<HTMLElement>('#scene-copy')!;
const provenance = document.querySelector<HTMLElement>('#scene-provenance')!;
const scale = document.querySelector<HTMLElement>('#scale-readout')!;
const previous = document.querySelector<HTMLButtonElement>('#previous')!;
const next = document.querySelector<HTMLButtonElement>('#next')!;
const progress = document.querySelector<HTMLElement>('#progress')!;
const fallback = document.querySelector<HTMLElement>('#fallback')!;
const textToggle = document.querySelector<HTMLButtonElement>('#text-toggle')!;
const textToggleState = document.querySelector<HTMLElement>('#text-toggle-state')!;
const TEXT_VISIBILITY_KEY = 'universe-explorer:text-visible';
let textVisible = true;
try { textVisible = localStorage.getItem(TEXT_VISIBILITY_KEY) !== 'false'; } catch { /* Storage may be disabled. */ }
function updateTextVisibility() {
  document.body.classList.toggle('explanations-hidden', !textVisible);
  textToggle.setAttribute('aria-pressed', String(textVisible));
  textToggle.setAttribute('aria-label', textVisible ? 'Hide explanatory text' : 'Show explanatory text');
  textToggleState.textContent = textVisible ? 'ON' : 'OFF';
}
textToggle.addEventListener('click', () => {
  textVisible = !textVisible;
  try { localStorage.setItem(TEXT_VISIBILITY_KEY, String(textVisible)); } catch { /* The toggle still works for this visit. */ }
  updateTextVisibility();
});
updateTextVisibility();
const EARTH_RADIUS_KM = 6371;
const AU_KM = 149_597_870.7;
const LIGHT_YEAR_KM = 9.4607e12;

let renderer: THREE.WebGLRenderer | undefined;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
const cameraWorldPosition = new THREE.Vector3();
let frame = 0;
let active = 0;
let preparingJourney = false;
let journey: {
  from: number;
  to: number;
  start: number;
  duration: number;
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
  fromQuaternion: THREE.Quaternion;
  toQuaternion: THREE.Quaternion;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  fromLookAt: THREE.Vector3;
  toLookAt: THREE.Vector3;
  fromUp: THREE.Vector3;
  toUp: THREE.Vector3;
  earthArc: boolean;
  fromArtIndex: number;
  toArtIndex: number;
} | undefined;
const sceneGroups = new Map<number, THREE.Group>();
const starGeometry = new THREE.BufferGeometry();
let starMaterial: THREE.PointsMaterial | undefined;
const starPositions = new Float32Array(1600 * 3);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock = new THREE.Clock();
let seed = 8871;
function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
for (let i = 0; i < starPositions.length; i += 3) {
  const direction = new THREE.Vector3(random() - .5, random() - .5, random() - .5).normalize();
  starPositions[i] = direction.x; starPositions[i + 1] = direction.y; starPositions[i + 2] = direction.z;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

function vector(tuple?: [number, number, number], fallback: [number, number, number] = [0, 0, 0]) {
  return new THREE.Vector3(...(tuple ?? fallback));
}
function positionFor(index: number) {
  const stop = stops[index];
  const position = vector(stop.cameraPositionKm);
  if (!stop.cameraFrameWidthMeters || !stop.focusPositionKm) return position;
  const focus = vector(stop.focusPositionKm);
  const fov = (stop.cameraFovDegrees ?? 48) * Math.PI / 180;
  const aspect = camera?.aspect ?? window.innerWidth / Math.max(1, window.innerHeight);
  const frameWidthKm = stop.cameraFrameWidthMeters / 1000;
  const distance = frameWidthKm / (2 * Math.tan(fov / 2) * aspect);
  const offset = position.sub(focus);
  const zMagnitude = Math.sqrt(Math.max(0, distance ** 2 - offset.x ** 2 - offset.y ** 2));
  offset.z = Math.sign(offset.z || 1) * zMagnitude;
  return focus.add(offset);
}
function targetFor(index: number) { return vector(stops[index].focusPositionKm); }
function lookAtFor(stop: Stop) { return vector(stop.lookAtPositionKm, stop.focusPositionKm); }
function upFor(stop: Stop) { return vector(stop.cameraUp, [0, 1, 0]).normalize(); }
function orientationAt(position: THREE.Vector3, target: THREE.Vector3, up: THREE.Vector3) {
  const pose = new THREE.PerspectiveCamera();
  pose.position.copy(position);
  pose.up.copy(up);
  pose.lookAt(target);
  return pose.quaternion.clone();
}

function updateInterface(index: number) {
  const stop = stops[index];
  sceneWrap.classList.toggle('lunar-view', stop.id === 'moon');
  title.textContent = stop.title;
  chapter.textContent = 'CHAPTER ' + stop.chapter.toUpperCase();
  copy.textContent = stop.introduction;
  provenance.hidden = stop.renderer !== 'solar-system';
  provenance.textContent = stop.provenance === 'speculative'
    ? 'Speculative · not directly observed'
    : 'Illustrative scene · geometry anchored to measured values';
  scale.textContent = earthZoomArtIndexByStop[index] !== undefined
    ? artwork.labelAt(earthZoomArtIndexByStop[index])
    : stop.scaleLabel;
  previous.disabled = index === 0 || Boolean(journey) || preparingJourney;
  next.disabled = Boolean(journey) || preparingJourney;
  next.innerHTML = index === 0
    ? 'Begin ascent <span aria-hidden="true">↑</span>'
    : index === stops.length - 1
      ? 'Return to Earth <span aria-hidden="true">↺</span>'
      : 'Go further <span aria-hidden="true">→</span>';
  progress.replaceChildren(...stops.map((item, position) => {
    const button = document.createElement('button');
    button.className = position === index ? 'dot current' : 'dot';
    button.type = 'button'; button.title = item.title; button.disabled = Boolean(journey) || preparingJourney;
    button.setAttribute('aria-label', 'Go to ' + item.title);
    button.setAttribute('aria-current', position === index ? 'step' : 'false');
    button.addEventListener('click', () => navigate(position));
    return button;
  }));
  progress.setAttribute('aria-label', 'Stop ' + (index + 1) + ' of ' + stops.length);
}

function updateJourneyCopy(index: number) {
  const stop = stops[index];
  title.textContent = stop.title;
  chapter.textContent = 'CHAPTER ' + stop.chapter.toUpperCase();
  copy.textContent = stop.introduction;
  provenance.hidden = stop.renderer !== 'solar-system';
  provenance.textContent = stop.provenance === 'speculative'
    ? 'Speculative · not directly observed'
    : 'Illustrative scene · geometry anchored to measured values';
}

function ensureScene(index: number) {
  if (sceneGroups.has(index)) return;
  const stop = stops[index];
  const sceneRenderer = sceneRenderers[stop.renderer];
  if (!sceneRenderer) return;
  if (stop.renderer === 'planetary') {
    const sharedPlanet = [...sceneGroups.entries()].find(([existingIndex]) => stops[existingIndex].renderer === 'planetary')?.[1];
    if (sharedPlanet) { sceneGroups.set(index, sharedPlanet); return; }
  }
  if (stop.renderer === 'solar-system') {
    const sharedSolar = [...sceneGroups.entries()].find(([existingIndex]) => stops[existingIndex].renderer === 'solar-system')?.[1];
    if (sharedSolar) { sceneGroups.set(index, sharedSolar); return; }
  }
  const group = sceneRenderer.create(stop);
  group.userData.worldPosition ??= group.position.clone();
  scene.add(group);
  sceneGroups.set(index, group);
}

async function navigate(requestedIndex: number) {
  if (journey || preparingJourney) return;
  const index = (requestedIndex + stops.length) % stops.length;
  if (index === active) return;
  ensureScene(index);

  const from = active;
  const fromArtIndex = earthZoomArtIndexByStop[from] ?? earthZoomArtIndexByStop.at(-1)!;
  const toArtIndex = earthZoomArtIndexByStop[index] ?? earthZoomArtIndexByStop.at(-1)!;
  preparingJourney = true;
  previous.disabled = true;
  next.disabled = true;
  progress.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  scale.textContent = 'Preparing the next view…';
  await artwork.prepareTransition(fromArtIndex, toArtIndex, stops[from].id === 'moon' || stops[index].id === 'moon');

  const fromPosition = cameraWorldPosition.clone();
  const toPosition = positionFor(index);
  const fromTarget = targetFor(from);
  const toTarget = targetFor(index);
  const fromLookAt = lookAtFor(stops[from]);
  const toLookAt = lookAtFor(stops[index]);
  const fromUp = camera.up.clone();
  const toUp = upFor(stops[index]);
  const earthToEarth = from < stops.findIndex((stop) => stop.id === 'moon') && index < stops.findIndex((stop) => stop.id === 'moon');
  const duration = reducedMotion ? .01 : earthToEarth ? 7.5 + Math.min(index, 4) * .35 : 9.5;

  journey = {
    from, to: index, start: performance.now(), duration: duration * 1000,
    fromPosition, toPosition,
    fromQuaternion: camera.quaternion.clone(),
    toQuaternion: orientationAt(toPosition, toLookAt, toUp),
    fromTarget, toTarget, fromLookAt, toLookAt, fromUp, toUp,
    earthArc: earthToEarth,
    fromArtIndex, toArtIndex,
  };
  preparingJourney = false;
  previous.disabled = true; next.disabled = true;
  progress.querySelectorAll('button').forEach((button) => { button.disabled = true; });
}

function formatDistance(distanceKm: number, reference = 'Earth center') {
  if (distanceKm < 1) return Math.round(distanceKm * 1000) + ` m from ${reference}`;
  if (distanceKm < 10_000) return Math.round(distanceKm).toLocaleString() + ` km from ${reference}`;
  if (distanceKm < 1_000_000) return distanceKm.toLocaleString(undefined, { maximumSignificantDigits: 3 }) + ` km from ${reference}`;
  if (distanceKm < 100 * AU_KM) return (distanceKm / AU_KM).toPrecision(3) + ' AU from Earth';
  return (distanceKm / LIGHT_YEAR_KM).toPrecision(3) + ' light-years from Earth';
}

function formatVisibleWidth(widthKm: number) {
  if (widthKm < 1_000_000) return Math.round(widthKm).toLocaleString() + ' km';
  if (widthKm < 1_000_000_000) return (widthKm / 1_000_000).toLocaleString(undefined, { maximumSignificantDigits: 3 }) + ' million km';
  if (widthKm < 1_000_000_000_000) return (widthKm / 1_000_000_000).toLocaleString(undefined, { maximumSignificantDigits: 3 }) + ' billion km';
  return (widthKm / LIGHT_YEAR_KM).toLocaleString(undefined, { maximumSignificantDigits: 3 }) + ' light-years';
}

function finishJourney() {
  if (!journey) return;
  active = journey.to;
  cameraWorldPosition.copy(positionFor(active));
  camera.position.set(0, 0, 0);
  camera.up.copy(upFor(stops[active]));
  camera.quaternion.copy(orientationAt(cameraWorldPosition, lookAtFor(stops[active]), camera.up));
  camera.fov = stops[active].cameraFovDegrees ?? 48;
  camera.updateProjectionMatrix();
  journey = undefined;
  updateInterface(active);
}

function updateJourney(now: number) {
  if (!journey) return;
  const raw = Math.min(1, (now - journey.start) / journey.duration);
  const eased = journey.earthArc ? raw ** 2.4 : raw * raw * (3 - 2 * raw);
  const lunarToEarthMoon = stops[journey.from].id === 'moon' && stops[journey.to].id === 'earth-moon';
  if (stops[journey.to].id === 'moon') {
    artwork.showLunarArrival(journey.fromArtIndex, eased);
    if (eased >= .56) updateJourneyCopy(journey.to);
  } else if (lunarToEarthMoon) {
    artwork.showLunarDepartureToSystem(eased);
    if (eased >= .44) updateJourneyCopy(journey.to);
  } else if (stops[journey.from].id === 'moon') {
    artwork.showLunarDeparture(journey.toArtIndex, eased);
    if (eased >= .44) updateJourneyCopy(journey.to);
  } else if (journey.earthArc) {
    artwork.showEarthTransition(journey.fromArtIndex, journey.toArtIndex, eased);
  }
  if (lunarToEarthMoon) {
    // Rise away from the near-side surface. The vertical retreat makes both bodies recede;
    // easing the lateral move to the pair's midpoint preserves their 384,400 km separation.
    const lateral = eased * eased;
    const rise = eased ** .65;
    cameraWorldPosition.set(
      journey.fromPosition.x + (journey.toPosition.x - journey.fromPosition.x) * lateral,
      journey.fromPosition.y + (journey.toPosition.y - journey.fromPosition.y) * rise,
      journey.fromPosition.z + (journey.toPosition.z - journey.fromPosition.z) * rise,
    );
  } else {
    const fromDistance = journey.fromPosition.distanceTo(journey.fromTarget);
    const toDistance = journey.toPosition.distanceTo(journey.toTarget);
    const distance = Math.exp(Math.log(fromDistance) + (Math.log(toDistance) - Math.log(fromDistance)) * eased);
    const target = journey.fromTarget.clone().lerp(journey.toTarget, eased);
    const startDirection = journey.fromPosition.clone().sub(journey.fromTarget).normalize();
    const endDirection = journey.toPosition.clone().sub(journey.toTarget).normalize();
    const direction = startDirection.lerp(endDirection, eased).normalize();
    cameraWorldPosition.copy(target).addScaledVector(direction, distance);
  }
  camera.position.set(0, 0, 0);
  camera.up.copy(journey.fromUp.clone().lerp(journey.toUp, eased).normalize());

  if (journey.earthArc) {
    // Keep the original camera quaternion throughout the radial Earth ascent.
    camera.quaternion.copy(journey.fromQuaternion);
  } else if (stops[journey.from].id === 'earth' && stops[journey.to].id === 'moon') {
    // Retreat toward the Moon while keeping Earth in view; never pivot to face the lunar surface.
    const earthFacingBlend = THREE.MathUtils.smoothstep(eased, 0, .18);
    const lookTarget = journey.fromLookAt.clone().lerp(journey.fromTarget, earthFacingBlend);
    camera.lookAt(lookTarget.sub(cameraWorldPosition));
  } else {
    const lookTarget = journey.fromLookAt.clone().lerp(journey.toLookAt, eased);
    camera.lookAt(lookTarget.clone().sub(cameraWorldPosition));
  }

  const fromFov = stops[journey.from].cameraFovDegrees ?? 48;
  const toFov = stops[journey.to].cameraFovDegrees ?? 48;
  camera.fov = fromFov + (toFov - fromFov) * eased;
  camera.updateProjectionMatrix();
  if (stops[journey.to].id === 'moon') {
    scale.textContent = eased < .5
      ? formatDistance(cameraWorldPosition.length(), 'Earth center')
      : formatDistance(cameraWorldPosition.distanceTo(journey.toTarget), 'Moon center');
  } else if (lunarToEarthMoon || stops[journey.from].renderer === 'solar-system' || stops[journey.to].renderer === 'solar-system') {
    const fromWidth = stops[journey.from].visibleWidthMeters / 1000;
    const toWidth = stops[journey.to].visibleWidthMeters / 1000;
    const width = Math.exp(Math.log(fromWidth) + (Math.log(toWidth) - Math.log(fromWidth)) * eased);
    scale.textContent = 'View width · ' + formatVisibleWidth(width);
  } else if (stops[journey.from].id === 'moon') {
    scale.textContent = eased < .5
      ? formatDistance(cameraWorldPosition.distanceTo(journey.fromTarget), 'Moon center')
      : artwork.labelAt(artwork.frameIndexAt(earthZoomArtIndexByStop.at(-1)!, journey.toArtIndex, (eased - .5) / .5));
  } else if (journey.earthArc) {
    scale.textContent = artwork.labelAt(artwork.frameIndexAt(journey.fromArtIndex, journey.toArtIndex, eased));
  } else {
    scale.textContent = formatDistance(cameraWorldPosition.length());
  }
  if (raw >= 1) finishJourney();
}

function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(stops[0].cameraFovDegrees ?? 48, canvas.clientWidth / canvas.clientHeight, .0001, 1e25);
    cameraWorldPosition.copy(positionFor(0));
    camera.position.set(0, 0, 0);
    camera.up.copy(upFor(stops[0]));
    camera.quaternion.copy(orientationAt(cameraWorldPosition, lookAtFor(stops[0]), camera.up));

    starMaterial = new THREE.PointsMaterial({ color: 0xc7d8ff, size: 1.25, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false });
    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.frustumCulled = false; scene.add(stars);
    scene.add(new THREE.AmbientLight(0x8ea9d8, .3));
    ensureScene(stops.findIndex((stop) => stop.renderer === 'planetary'));
    window.addEventListener('resize', resize);
    render();
  } catch (error) {
    fallback.hidden = false;
    console.error('Unable to initialize the 3D scene', error);
  }
}

function resize() {
  if (!renderer) return;
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  if (journey) journey.toPosition.copy(positionFor(journey.to));
  else {
    cameraWorldPosition.copy(positionFor(active));
    camera.quaternion.copy(orientationAt(cameraWorldPosition, lookAtFor(stops[active]), upFor(stops[active])));
  }
}

function render() {
  if (!renderer) return;
  frame = requestAnimationFrame(render);
  const elapsed = clock.getElapsedTime();
  updateJourney(performance.now());
  if (!journey) {
    if (stops[active].id === 'moon') artwork.showLunarArrival(earthZoomArtIndexByStop.at(-1)!, 1);
    else if (earthZoomArtIndexByStop[active] !== undefined) artwork.showEarthFrame(earthZoomArtIndexByStop[active]);
    else artwork.showSceneOnly();
  }
  const distance = Math.max(EARTH_RADIUS_KM, cameraWorldPosition.length());
  if (starMaterial) starMaterial.opacity = .72 * THREE.MathUtils.smoothstep(distance, EARTH_RADIUS_KM * 1.5, EARTH_RADIUS_KM * 12);
  const stars = scene.children.find((object) => object instanceof THREE.Points) as THREE.Points | undefined;
  if (stars) { stars.position.set(0, 0, 0); stars.quaternion.copy(camera.quaternion); stars.scale.setScalar(distance * 100); }
  const visibleWidthKm = journey
    ? Math.exp(Math.log(stops[journey.from].visibleWidthMeters / 1000) + (Math.log(stops[journey.to].visibleWidthMeters / 1000) - Math.log(stops[journey.from].visibleWidthMeters / 1000)) * Math.min(1, (performance.now() - journey.start) / journey.duration))
    : stops[active].visibleWidthMeters / 1000;
  const context = { cameraWorldPosition, visibleWidthKm, viewportWidth: canvas.clientWidth, activeRenderer: journey ? stops[journey.to].renderer : stops[active].renderer };
  const updatedGroups = new Set<THREE.Group>();
  for (const [index, group] of sceneGroups) {
    if (updatedGroups.has(group)) continue;
    updatedGroups.add(group);
    group.position.copy(group.userData.worldPosition as THREE.Vector3).sub(cameraWorldPosition);
    sceneRenderers[stops[index].renderer]?.update?.(group, elapsed, context);
  }
  renderer.render(scene, camera);
}

previous.addEventListener('click', () => navigate(active - 1));
next.addEventListener('click', () => navigate(active === stops.length - 1 ? 0 : active + 1));
document.addEventListener('keydown', (event) => {
  if (journey || preparingJourney || (event.target instanceof HTMLElement && ['BUTTON', 'INPUT', 'TEXTAREA'].includes(event.target.tagName))) return;
  if (event.key === 'ArrowRight') navigate(active + 1);
  if (event.key === 'ArrowLeft') navigate(active - 1);
});
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(frame);
  const disposedTextures = new Set<THREE.Texture>();
  for (const group of new Set(sceneGroups.values())) {
    group.userData.disposed = true;
    group.traverse((object) => {
      const mesh = object as THREE.Mesh; mesh.geometry?.dispose?.();
      const materials = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
      for (const material of materials) {
        const map = (material as THREE.Material & { map?: THREE.Texture }).map;
        if (map && !disposedTextures.has(map)) { map.dispose(); disposedTextures.add(map); }
        material.dispose();
      }
    });
    const sharedTextures = group.userData.sharedTextures as THREE.Texture[] | undefined;
    sharedTextures?.forEach((texture) => {
      if (!disposedTextures.has(texture)) { texture.dispose(); disposedTextures.add(texture); }
    });
  }
  renderer?.dispose();
});

updateInterface(0);
init();
