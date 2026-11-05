import * as THREE from 'three';
import type { SceneRenderer } from './types';

const MOON_RADIUS_KM = 1737.4;

function makeLunarMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const context = canvas.getContext('2d')!;
  const pixels = context.createImageData(canvas.width, canvas.height);
  let seed = 771;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const noise = Math.sin(x * .071) * 5 + Math.cos(y * .053) * 4 + (random() - .5) * 13;
      const value = Math.max(0, Math.min(255, 119 + noise));
      const offset = (y * canvas.width + x) * 4;
      pixels.data[offset] = value;
      pixels.data[offset + 1] = value - 1;
      pixels.data[offset + 2] = value - 3;
      pixels.data[offset + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  for (let i = 0; i < 340; i++) {
    const x = random() * canvas.width, y = random() * canvas.height;
    const radius = 2 + random() * 28;
    for (const wrapX of [x - canvas.width, x, x + canvas.width]) {
      const gradient = context.createRadialGradient(wrapX, y, radius * .18, wrapX, y, radius);
      gradient.addColorStop(0, 'rgba(66, 65, 63, .72)');
      gradient.addColorStop(.55, 'rgba(94, 92, 88, .35)');
      gradient.addColorStop(.82, 'rgba(190, 187, 180, .52)');
      gradient.addColorStop(1, 'rgba(82, 81, 78, .08)');
      context.fillStyle = gradient;
      context.beginPath(); context.arc(wrapX, y, radius, 0, Math.PI * 2); context.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  return texture;
}

function makeLunarDetail() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#808080';
  context.fillRect(0, 0, canvas.width, canvas.height);
  let seed = 1984;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 420; i++) {
    const x = random() * canvas.width, y = random() * canvas.height;
    const radius = 2 + random() * 14;
    const crater = context.createRadialGradient(x, y, radius * .15, x, y, radius);
    crater.addColorStop(0, '#929292');
    crater.addColorStop(.68, '#777777');
    crater.addColorStop(.86, '#a1a1a1');
    crater.addColorStop(1, '#808080');
    context.fillStyle = crater;
    context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.channel = 1;
  return texture;
}

function siteFrame(stop: Parameters<SceneRenderer['create']>[0]) {
  const up = new THREE.Vector3(...(stop.sceneUp ?? [-1, 0, 0])).normalize();
  const right = new THREE.Vector3(0, 1, 0);
  const forward = new THREE.Vector3(...(stop.sceneForward ?? [-.707, 0, -.707])).normalize();
  return { up, right, forward };
}

function lunarSurface(frame: ReturnType<typeof siteFrame>, material: THREE.Material) {
  const size = 12, segments = 160;
  const positions: number[] = [], uvs: number[] = [], detailUvs: number[] = [], indices: number[] = [];
  for (let row = 0; row <= segments; row++) {
    const v = row / segments;
    const localForward = (v - .5) * size;
    for (let column = 0; column <= segments; column++) {
      const u = column / segments;
      const localRight = (u - .5) * size;
      const radius = Math.hypot(localRight, localForward);
      const surface = Math.sqrt(Math.max(0, MOON_RADIUS_KM ** 2 - radius ** 2)) - MOON_RADIUS_KM;
      const relief = (Math.sin(localRight * 7.1 + localForward * 2.4) + Math.sin(localForward * 4.2 - localRight * 1.8)) * .0007;
      const point = frame.up.clone().multiplyScalar(MOON_RADIUS_KM + surface + relief)
        .addScaledVector(frame.right, localRight)
        .addScaledVector(frame.forward, localForward);
      positions.push(point.x, point.y, point.z);
      const longitude = (Math.atan2(point.z, -point.x) / (Math.PI * 2) + 1) % 1;
      const latitude = Math.acos(THREE.MathUtils.clamp(point.y / MOON_RADIUS_KM, -1, 1)) / Math.PI;
      uvs.push(longitude, latitude);
      detailUvs.push(u * 8, (1 - v) * 8);
      if (row < segments && column < segments) {
        const a = row * (segments + 1) + column, b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('uv1', new THREE.Float32BufferAttribute(detailUvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

export const lunarRenderer: SceneRenderer = {
  kind: 'lunar',
  cameraDistance: MOON_RADIUS_KM,
  create(stop) {
    const group = new THREE.Group();
    group.position.set(...(stop.scenePositionKm ?? [384400, 0, 0]));
    group.userData.worldPosition = group.position.clone();

    const map = makeLunarMap();
    const moon = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS_KM, 128, 96), new THREE.MeshStandardMaterial({
      map, bumpMap: map, bumpScale: .012, roughness: .98, metalness: 0,
    }));
    group.add(moon);

    const frame = siteFrame(stop);
    const localMap = map.clone();
    localMap.needsUpdate = true;
    const detailMap = makeLunarDetail();
    const ground = lunarSurface(frame, new THREE.MeshStandardMaterial({
      map: localMap, bumpMap: detailMap, bumpScale: .02, roughness: 1, metalness: 0, side: THREE.DoubleSide,
    }));
    group.add(ground);

    const random = (() => { let seed = 944; return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; })();
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x716f6a, roughness: 1 });
    for (let i = 0; i < 80; i++) {
      const east = (random() - .5) * 8;
      const ahead = (random() - .5) * 8;
      const radius = Math.hypot(east, ahead);
      const surface = Math.sqrt(Math.max(0, MOON_RADIUS_KM ** 2 - radius ** 2)) - MOON_RADIUS_KM;
      const point = frame.up.clone().multiplyScalar(MOON_RADIUS_KM + surface)
        .addScaledVector(frame.right, east).addScaledVector(frame.forward, ahead);
      const scale = .006 + random() * .026;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 0), rockMaterial);
      rock.position.copy(point);
      rock.rotation.set(random() * 2, random() * Math.PI, random() * 2);
      group.add(rock);
    }

    const sunlight = new THREE.DirectionalLight(0xe4e7ef, 1.9);
    sunlight.position.copy(frame.up).multiplyScalar(5000);
    group.add(sunlight);
    group.add(new THREE.AmbientLight(0x606879, .45));
    group.userData.sharedTextures = [map, localMap, detailMap];
    return group;
  },
};
