import * as THREE from 'three';
import type { SceneRenderer } from './types';

function textSprite(text: string, color: string) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
  const context = canvas.getContext('2d')!; context.font = '32px system-ui'; context.fillStyle = color; context.fillText(text, 12, 60);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }));
  sprite.scale.set(4.4, .82, 1); return sprite;
}
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}
export const galacticRenderer: SceneRenderer = {
  kind: 'galactic',
  cameraDistance: 10,
  create() {
    const group = new THREE.Group();
    const count = 7200, positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
    const random = seededRandom(1701);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const arm = Math.floor(random() * 4), radius = .15 + random() * 4.7;
      const angle = arm * Math.PI / 2 + radius * .83 + (random() - .5) * .46;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (random() - .5) * (.18 + radius * .045);
      positions[i * 3 + 2] = Math.sin(angle) * radius * .62;
      color.setHSL(.10 + random() * .08, .65, .57 + random() * .3);
      colors.set([color.r, color.g, color.b], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    group.add(new THREE.Points(geometry, new THREE.PointsMaterial({ size: .024, vertexColors: true, transparent: true, opacity: .86, depthWrite: false })));
    const core = new THREE.Mesh(new THREE.SphereGeometry(.34, 32, 24), new THREE.MeshBasicMaterial({ color: 0xffd89b, transparent: true, opacity: .65 }));
    core.scale.set(1, .22, .68); group.add(core);
    const sunPosition = new THREE.Vector3(-1.69, .17, .22);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(.075, 16, 12), new THREE.MeshBasicMaterial({ color: 0x72dbff }));
    sun.position.copy(sunPosition); group.add(sun);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(.18, 16, 12), new THREE.MeshBasicMaterial({ color: 0x71d9ff, transparent: true, opacity: .2, depthWrite: false }));
    halo.position.copy(sunPosition); group.add(halo);
    const marker = textSprite('SUN · ~26,000 LIGHT-YEARS FROM GALACTIC CENTER', '#c9e8ff');
    marker.position.set(-1.5, .72, .25); marker.scale.set(5.1, .72, 1); group.add(marker);
    const note = textSprite('RECONSTRUCTED VIEW · NOT A PHOTOGRAPH', '#aab8d2');
    note.position.set(0, -1.8, 0); note.scale.set(4, .52, 1); group.add(note);
    group.scale.setScalar(1.46e17);
    group.position.x = 2.47e17;
    return group;
  },
  update(group, elapsed) { group.rotation.y = Math.sin(elapsed * .08) * .035; },
};
