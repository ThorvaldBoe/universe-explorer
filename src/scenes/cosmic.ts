import * as THREE from 'three';
import type { SceneRenderer } from './types';

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}
export const cosmicRenderer: SceneRenderer = {
  kind: 'cosmological',
  cameraDistance: 10,
  create() {
    const group = new THREE.Group(), random = seeded(41021), nodes: THREE.Vector3[] = [];
    const nodePositions: number[] = [], linePositions: number[] = [];
    for (let i = 0; i < 220; i++) {
      const p = new THREE.Vector3((random() - .5) * 9, (random() - .5) * 5.5, (random() - .5) * 5.5);
      nodes.push(p); nodePositions.push(p.x, p.y, p.z);
    }
    for (let i = 0; i < nodes.length; i++) {
      const nearby = nodes.map((point, index) => ({ index, distance: point.distanceToSquared(nodes[i]) }))
        .filter((item) => item.index > i).sort((a, b) => a.distance - b.distance).slice(0, 2);
      for (const item of nearby) {
        if (item.distance > 3.6) continue;
        const p = nodes[item.index], q = nodes[i];
        linePositions.push(p.x, p.y, p.z, q.x, q.y, q.z);
      }
    }
    const lines = new THREE.BufferGeometry(); lines.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    group.add(new THREE.LineSegments(lines, new THREE.LineBasicMaterial({ color: 0x547fbc, transparent: true, opacity: .34, depthWrite: false })));
    const points = new THREE.BufferGeometry(); points.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
    group.add(new THREE.Points(points, new THREE.PointsMaterial({ color: 0xd9e8ff, size: .055, transparent: true, opacity: .85, depthWrite: false })));
    return group;
  },
  update(group, elapsed) { group.rotation.y = elapsed * .025; group.rotation.x = Math.sin(elapsed * .06) * .02; },
};
