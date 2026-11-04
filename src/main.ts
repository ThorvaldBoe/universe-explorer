import * as THREE from 'three';
import { stops } from './data/stops';
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

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let earth: THREE.Mesh;
let frame = 0;
let active = 0;

function setStop(index: number) {
  active = Math.max(0, Math.min(stops.length - 1, index));
  const stop = stops[active];
  title.textContent = stop.title;
  chapter.textContent = `CHAPTER ${stop.chapter.toUpperCase()}`;
  copy.textContent = stop.introduction;
  scale.textContent = stop.scaleLabel;
  previous.disabled = active === 0;
  next.innerHTML = active === stops.length - 1 ? 'Journey preview <span aria-hidden="true">↗</span>' : 'Go further <span aria-hidden="true">→</span>';
  progress.replaceChildren(...stops.map((item, position) => {
    const dot = document.createElement('span');
    dot.className = position === active ? 'dot current' : 'dot';
    dot.title = item.title;
    return dot;
  }));
  document.querySelector('#progress')?.setAttribute('aria-label', `Stop ${active + 1} of ${stops.length}`);
}

function initScene() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 8;
    scene.add(new THREE.AmbientLight(0x9bbcff, 1.7));
    const sun = new THREE.DirectionalLight(0xffd9a6, 3.2);
    sun.position.set(-4, 3, 5);
    scene.add(sun);
    const geometry = new THREE.SphereGeometry(2.1, 96, 72);
    const material = new THREE.MeshStandardMaterial({ color: 0x236ca2, roughness: 0.82, metalness: 0.02 });
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.18, 72, 56),
      new THREE.MeshBasicMaterial({ color: 0x55aaff, transparent: true, opacity: 0.11, side: THREE.BackSide }),
    );
    scene.add(atmosphere);

    const starPositions = new Float32Array(900 * 3);
    for (let i = 0; i < starPositions.length; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 45;
      starPositions[i + 1] = (Math.random() - 0.5) * 30;
      starPositions[i + 2] = (Math.random() - 0.5) * 30 - 8;
    }
    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xc7d8ff, size: 0.055, sizeAttenuation: true })));

    window.addEventListener('resize', resize);
    render();
  } catch {
    fallback.hidden = false;
  }
}

function resize() {
  if (!renderer) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function render() {
  frame = requestAnimationFrame(render);
  earth.rotation.y += 0.0008;
  renderer.render(scene, camera);
}

previous.addEventListener('click', () => setStop(active - 1));
next.addEventListener('click', () => setStop(active + 1));
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') setStop(active + 1);
  if (event.key === 'ArrowLeft') setStop(active - 1);
});
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(frame);
  renderer?.dispose();
});

setStop(0);
initScene();
