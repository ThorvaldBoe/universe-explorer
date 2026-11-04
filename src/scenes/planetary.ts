import * as THREE from 'three';
import type { SceneRenderer } from './types';

const planetColors = [0xaca7a0, 0xd89e73, 0x648cc8, 0xb5a486, 0xd5b68b, 0x82c6c9, 0x4f77d8, 0x747fd1];
const names = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const distancesAu = [.39, .72, 1, 1.52, 5.2, 9.58, 19.2, 30.05];

function label(text: string, position: THREE.Vector3, color = '#dce8ff') {
  const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 64;
  const context = canvas.getContext('2d')!; context.font = '26px system-ui'; context.fillStyle = color; context.fillText(text, 8, 42);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }));
  sprite.position.copy(position); sprite.scale.set(2.5, .5, 1); return sprite;
}
function body(radius: number, color: number) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), new THREE.MeshStandardMaterial({ color, roughness: .9 }));
}

export const planetaryRenderer: SceneRenderer = {
  kind: 'planetary',
  cameraDistance: 9,
  create(stop) {
    const group = new THREE.Group();
    if (stop.id === 'earth') {
      const earth = body(2.05, 0x287aa9);
      const material = earth.material as THREE.MeshStandardMaterial;
      material.color.set(0x287aa9);
      group.add(earth);
      group.add(new THREE.Mesh(new THREE.SphereGeometry(2.1, 64, 48), new THREE.MeshBasicMaterial({ color: 0xa9e1ff, transparent: true, opacity: .10, side: THREE.BackSide, depthWrite: false })));
      group.add(new THREE.Mesh(new THREE.SphereGeometry(2.2, 64, 48), new THREE.MeshBasicMaterial({ color: 0x3c9ee4, transparent: true, opacity: .09, side: THREE.BackSide, depthWrite: false })));
      const light = new THREE.DirectionalLight(0xffe1a7, 3.5); light.position.set(-4, 3, 5); group.add(light);
      group.add(new THREE.AmbientLight(0x9bbcff, 1.35));
      return group;
    }
    group.add(new THREE.AmbientLight(0x98aeda, 1.4));
    const light = new THREE.PointLight(0xffd386, 65, 100); group.add(light);
    group.add(body(.28, 0xffc65c));
    group.add(label('SUN', new THREE.Vector3(0, .5, 0), '#ffe2a2'));
    const scale = 10 / 64;
    for (let i = 0; i < distancesAu.length; i++) {
      const d = distancesAu[i];
      const orbit = new THREE.Mesh(new THREE.RingGeometry(d * scale - .006, d * scale + .006, 128), new THREE.MeshBasicMaterial({ color: 0x8396b6, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false }));
      orbit.rotation.x = Math.PI / 2; group.add(orbit);
      const angle = [1.8, 3.6, 5.1, .5, 2.2, 4.2, .2, 2.8][i];
      const pos = new THREE.Vector3(Math.cos(angle) * d * scale, 0, Math.sin(angle) * d * scale);
      const object = body(i === 4 ? .14 : .075, planetColors[i]);
      object.position.copy(pos); group.add(object);
      group.add(label(names[i], pos.clone().add(new THREE.Vector3(0, .24, 0))));
    }
    const note = label('PLANET SIZES ENLARGED FOR VISIBILITY', new THREE.Vector3(0, -2.0, 0), '#aab8d2');
    note.scale.set(4.8, .46, 1); group.add(note);
    return group;
  },
  update(group, elapsed) {
    if (group.children[0] instanceof THREE.Mesh) group.children[0].rotation.y = elapsed * .08;
  },
};
