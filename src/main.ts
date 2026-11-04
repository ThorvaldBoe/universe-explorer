import * as THREE from 'three';
import { stops } from './data/stops';
import { sceneRenderers } from './scenes/registry';
import { setOpacity } from './scenes/types';
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

let renderer: THREE.WebGLRenderer | undefined;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let frame = 0;
let active = 0;
let activeRenderer: RendererKind = stops[0].renderer;
let currentGroup: THREE.Group | undefined;
let nextGroup: THREE.Group | undefined;
let transitionStart = 0;
let transitionFromLogWidth = 0;
let transitionToLogWidth = 0;
let transitionFromCamera = 9;
let transitionToCamera = 9;
let transitionDirection = 1;
const clock = new THREE.Clock();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const transitionDuration = reducedMotion ? .18 : 2.4;

let seed = 8871;
function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
const starPositions = new Float32Array(1400 * 3);
for (let i = 0; i < starPositions.length; i += 3) {
  starPositions[i] = (random() - .5) * 55; starPositions[i + 1] = (random() - .5) * 35; starPositions[i + 2] = (random() - .5) * 34 - 12;
}

function updateInterface(index: number) {
  const stop = stops[index];
  title.textContent = stop.title;
  chapter.textContent = `CHAPTER ${stop.chapter.toUpperCase()}`;
  copy.textContent = stop.introduction;
  scale.textContent = stop.scaleLabel;
  previous.disabled = index === 0;
  next.innerHTML = index === stops.length - 1 ? 'Return to Earth <span aria-hidden="true">↺</span>' : 'Go further <span aria-hidden="true">→</span>';
  progress.replaceChildren(...stops.map((item, position) => {
    const button = document.createElement('button');
    button.className = position === index ? 'dot current' : 'dot';
    button.type = 'button'; button.title = item.title; button.setAttribute('aria-label', `Go to ${item.title}`);
    button.setAttribute('aria-current', position === index ? 'step' : 'false');
    button.addEventListener('click', () => navigate(position));
    return button;
  }));
  progress.setAttribute('aria-label', `Stop ${index + 1} of ${stops.length}`);
}

function disposeGroup(group: THREE.Group) {
  group.traverse((object) => {
    const item = object as THREE.Mesh;
    item.geometry?.dispose?.();
    const materials = item.material ? (Array.isArray(item.material) ? item.material : [item.material]) : [];
    for (const material of materials) {
      (material as THREE.Material & { map?: THREE.Texture }).map?.dispose();
      material.dispose();
    }
  });
}
function finishTransition() {
  if (!nextGroup) return;
  if (currentGroup) { scene.remove(currentGroup); disposeGroup(currentGroup); }
  currentGroup = nextGroup; nextGroup = undefined;
  activeRenderer = stops[active].renderer;
  currentGroup.position.set(0, 0, 0);
  currentGroup.scale.setScalar(1);
  setOpacity(currentGroup, 1);
}

function navigate(requestedIndex: number) {
  const index = (requestedIndex + stops.length) % stops.length;
  if (index === active && currentGroup) return;
  if (!scene || !renderer) { active = index; updateInterface(active); return; }
  if (nextGroup) finishTransition();
  const from = active;
  transitionDirection = index >= from ? 1 : -1;
  active = index;
  updateInterface(active);
  const stop = stops[index], targetRenderer = sceneRenderers[stop.renderer];
  nextGroup = targetRenderer.create(stop);
  scene.add(nextGroup);
  nextGroup.position.x = transitionDirection * 1.8;
  nextGroup.scale.setScalar(.58);
  setOpacity(nextGroup, 1);
  transitionFromLogWidth = Math.log10(stops[from].visibleWidthMeters);
  transitionToLogWidth = Math.log10(stop.visibleWidthMeters);
  transitionFromCamera = camera.position.z;
  transitionToCamera = targetRenderer.cameraDistance + (canvas.clientWidth < 650 && targetRenderer.kind === 'planetary' ? 3 : 0);
  transitionStart = performance.now();
}

function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, .1, 100);
    camera.position.set(0, 0, sceneRenderers[activeRenderer].cameraDistance + (canvas.clientWidth < 650 && activeRenderer === 'planetary' ? 3 : 0));
    const stars = new THREE.BufferGeometry();
    stars.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xc7d8ff, size: .045, sizeAttenuation: true, transparent: true, opacity: .72 })));
    scene.add(new THREE.AmbientLight(0x8ea9d8, .65));
    currentGroup = sceneRenderers[stops[0].renderer].create(stops[0]); scene.add(currentGroup);
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
  currentGroup && sceneRenderers[activeRenderer].update?.(currentGroup, elapsed);
  if (nextGroup) {
    const raw = Math.min(1, (performance.now() - transitionStart) / (transitionDuration * 1000));
    const eased = raw < .5 ? 4 * raw ** 3 : 1 - Math.pow(-2 * raw + 2, 3) / 2;
    const logWidth = transitionFromLogWidth + (transitionToLogWidth - transitionFromLogWidth) * eased;
    const scaleProgress = transitionToLogWidth === transitionFromLogWidth ? eased : (logWidth - transitionFromLogWidth) / (transitionToLogWidth - transitionFromLogWidth);
    camera.position.z = Math.exp(Math.log(transitionFromCamera) + (Math.log(transitionToCamera) - Math.log(transitionFromCamera)) * scaleProgress);
    if (currentGroup) {
      currentGroup.position.x = -transitionDirection * 1.8 * eased;
      currentGroup.scale.setScalar(1 - .42 * eased);
    }
    nextGroup.position.x = transitionDirection * 1.8 * (1 - eased);
    nextGroup.scale.setScalar(.58 + .42 * eased);
    sceneRenderers[stops[active].renderer].update?.(nextGroup, elapsed);
    if (raw >= 1) finishTransition();
  }
  renderer.render(scene, camera);
}
previous.addEventListener('click', () => navigate(active - 1));
next.addEventListener('click', () => navigate(active === stops.length - 1 ? 0 : active + 1));
document.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLElement && ['BUTTON', 'INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
  if (event.key === 'ArrowRight') navigate(active + 1);
  if (event.key === 'ArrowLeft') navigate(active - 1);
});
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(frame); currentGroup && disposeGroup(currentGroup); nextGroup && disposeGroup(nextGroup); renderer?.dispose();
});
updateInterface(0); init();
