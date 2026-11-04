import * as THREE from 'three';
import { stops } from './data/stops';
import { sceneRenderers } from './scenes/registry';
import type { RendererKind } from './types';
import './style.css';

const canvas = document.querySelector<HTMLCanvasElement>('#universe')!;
const title = document.querySelector<HTMLElement>('#scene-title')!;
const chapter = document.querySelector<HTMLElement>('#chapter')!;
const copy = document.querySelector<HTMLElement>('#scene-copy')!;
const scale = document.querySelector<HTMLElement>('#scale-readout')!;
const previous = document.querySelector<HTMLButtonElement>('#previous')!;
const next = document.querySelector<HTMLButtonElement>('#next')!;
const progress = document.querySelector<HTMLElement>('#progress')!;
const fallback = document.querySelector<HTMLElement>('#fallback')!;
const EARTH_RADIUS_KM = 6371;
const AU_KM = 149_597_870.7;
const LIGHT_YEAR_KM = 9.4607e12;
const stopDistancesKm = [EARTH_RADIUS_KM + .002, 100 * AU_KM, 2.4e18, 3.2e22];

let renderer: THREE.WebGLRenderer | undefined;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let frame = 0;
let active = 0;
let activeRenderer: RendererKind = stops[0].renderer;
let journey: { from: number; to: number; start: number; duration: number; fromPosition: THREE.Vector3; toPosition: THREE.Vector3; fromQuaternion: THREE.Quaternion; toQuaternion: THREE.Quaternion; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; earthArc: boolean; returnArc: boolean } | undefined;
const sceneGroups = new Map<number, THREE.Group>();
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(1600 * 3);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const journeyDuration = reducedMotion ? .01 : 4.6;
const clock = new THREE.Clock();
let seed = 8871;
function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
for (let i = 0; i < starPositions.length; i += 3) {
  const direction = new THREE.Vector3(random() - .5, random() - .5, random() - .5).normalize();
  starPositions[i] = direction.x; starPositions[i + 1] = direction.y; starPositions[i + 2] = direction.z;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

function updateInterface(index: number) {
  const stop = stops[index];
  title.textContent = stop.title;
  chapter.textContent = 'CHAPTER ' + stop.chapter.toUpperCase();
  copy.textContent = stop.introduction;
  scale.textContent = stop.scaleLabel;
  previous.disabled = index === 0 || Boolean(journey);
  next.disabled = Boolean(journey);
  next.innerHTML = index === 0 ? 'Begin journey <span aria-hidden="true">→</span>' : index === stops.length - 1 ? 'Return to Earth <span aria-hidden="true">↺</span>' : 'Go further <span aria-hidden="true">→</span>';
  progress.replaceChildren(...stops.map((item, position) => {
    const button = document.createElement('button');
    button.className = position === index ? 'dot current' : 'dot';
    button.type = 'button'; button.title = item.title; button.disabled = Boolean(journey);
    button.setAttribute('aria-label', 'Go to ' + item.title);
    button.setAttribute('aria-current', position === index ? 'step' : 'false');
    button.addEventListener('click', () => navigate(position));
    return button;
  }));
  progress.setAttribute('aria-label', 'Stop ' + (index + 1) + ' of ' + stops.length);
}

function targetFor(index: number) {
  if (index === 1) return new THREE.Vector3(-AU_KM, 0, 0);
  if (index === 2) return new THREE.Vector3(2.47e17, 0, 0);
  return new THREE.Vector3(0, 0, 0);
}
function positionFor(index: number) {
  if (index === 0) return new THREE.Vector3(0, EARTH_RADIUS_KM + .002, 0);
  const target = targetFor(index);
  const direction = index === 2 ? new THREE.Vector3(0, .5, -.866).normalize() : new THREE.Vector3(0, 0, -1);
  return target.addScaledVector(direction, stopDistancesKm[index]);
}
function orientationAt(position: THREE.Vector3, target: THREE.Vector3, earthSurface = false) {
  const cameraPose = new THREE.PerspectiveCamera();
  cameraPose.position.copy(position);
  cameraPose.lookAt(earthSurface ? new THREE.Vector3(0, EARTH_RADIUS_KM - 35, -1000) : target);
  return cameraPose.quaternion.clone();
}
function ensureScene(index: number) {
  if (sceneGroups.has(index)) return;
  const stop = stops[index];
  const group = sceneRenderers[stop.renderer].create(stop);
  scene.add(group); sceneGroups.set(index, group);
}
function navigate(requestedIndex: number) {
  if (journey) return;
  const index = (requestedIndex + stops.length) % stops.length;
  if (index === active) return;
  ensureScene(index);
  const from = active;
  const toTarget = targetFor(index);
  const toPosition = positionFor(index);
  const fromQuaternion = camera.quaternion.clone();
  const toQuaternion = orientationAt(toPosition, toTarget, index === 0);
  journey = {
    from, to: index, start: performance.now(), duration: journeyDuration * 1000,
    fromPosition: camera.position.clone(), toPosition, fromQuaternion, toQuaternion,
    fromTarget: targetFor(from), toTarget, earthArc: from === 0 && index > 0, returnArc: index === 0 && from > 0,
  };
  previous.disabled = true; next.disabled = true;
  progress.querySelectorAll('button').forEach((button) => { button.disabled = true; });
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) return Math.round(distanceKm * 1000) + ' m from Earth';
  if (distanceKm < 1000) return Math.round(distanceKm) + ' km from Earth';
  if (distanceKm < 100 * AU_KM) return (distanceKm / AU_KM).toFixed(2) + ' AU from Earth';
  return (distanceKm / LIGHT_YEAR_KM).toPrecision(3) + ' light-years from Earth';
}
function finishJourney() {
  if (!journey) return;
  active = journey.to;
  activeRenderer = stops[active].renderer;
  camera.position.copy(positionFor(active));
  camera.quaternion.copy(orientationAt(camera.position, targetFor(active), active === 0));
  journey = undefined;
  updateInterface(active);
}
function updateJourney(now: number) {
  if (!journey) return;
  const raw = Math.min(1, (now - journey.start) / journey.duration);
  const eased = raw * raw * (3 - 2 * raw);
  const distance = Math.exp(Math.log(journey.fromPosition.distanceTo(journey.fromTarget)) + (Math.log(journey.toPosition.distanceTo(journey.toTarget)) - Math.log(journey.fromPosition.distanceTo(journey.fromTarget))) * eased);
  const target = journey.fromTarget.clone().lerp(journey.toTarget, eased);
  const startDirection = journey.earthArc ? new THREE.Vector3(0, 1, 0) : journey.fromPosition.clone().sub(journey.fromTarget).normalize();
  const endDirection = journey.returnArc ? new THREE.Vector3(0, 1, 0) : journey.toPosition.clone().sub(journey.toTarget).normalize();
  const direction = startDirection.lerp(endDirection, eased).normalize();
  camera.position.copy(target).addScaledVector(direction, distance);
  camera.quaternion.copy(journey.fromQuaternion).slerp(journey.toQuaternion, eased);
  scale.textContent = formatDistance(camera.position.length());
  if (raw >= 1) finishJourney();
}

function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, .0001, 1e25);
    camera.position.set(0, EARTH_RADIUS_KM + .002, 0);
    camera.lookAt(0, EARTH_RADIUS_KM - 35, -1000);
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xc7d8ff, size: 1.25, sizeAttenuation: false, transparent: true, opacity: .72, depthWrite: false }));
    stars.frustumCulled = false; scene.add(stars);
    scene.add(new THREE.AmbientLight(0x8ea9d8, .42));
    ensureScene(0);
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
  camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix();
}
function render() {
  if (!renderer) return;
  frame = requestAnimationFrame(render);
  const elapsed = clock.getElapsedTime();
  updateJourney(performance.now());
  const distance = Math.max(EARTH_RADIUS_KM, camera.position.length());
  const stars = scene.children.find((object) => object instanceof THREE.Points) as THREE.Points | undefined;
  if (stars) { stars.position.copy(camera.position); stars.quaternion.copy(camera.quaternion); stars.scale.setScalar(distance * 100); }
  for (const [index, group] of sceneGroups) sceneRenderers[stops[index].renderer].update?.(group, elapsed);
  renderer.render(scene, camera);
}
previous.addEventListener('click', () => navigate(active - 1));
next.addEventListener('click', () => navigate(active === stops.length - 1 ? 0 : active + 1));
document.addEventListener('keydown', (event) => {
  if (journey || (event.target instanceof HTMLElement && ['BUTTON', 'INPUT', 'TEXTAREA'].includes(event.target.tagName))) return;
  if (event.key === 'ArrowRight') navigate(active + 1);
  if (event.key === 'ArrowLeft') navigate(active - 1);
});
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(frame);
  for (const group of sceneGroups.values()) group.traverse((object) => {
    const mesh = object as THREE.Mesh; mesh.geometry?.dispose?.();
    const materials = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
    for (const material of materials) {
      (material as THREE.Material & { map?: THREE.Texture }).map?.dispose(); material.dispose();
    }
  });
  renderer?.dispose();
});
updateInterface(0); init();
