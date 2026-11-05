import * as THREE from 'three';
import type { SceneRenderer } from './types';
const cityMasterUrl = new URL('../assets/city-master.svg', import.meta.url).href;
const cityStreetPanoramaUrl = new URL('../assets/city-street-panorama.png', import.meta.url).href;
import { createTexturePyramid, type TexturePyramidLevel } from './texture-pyramid';

const EARTH_RADIUS_METERS = 6_371_000;
const MAP_SIZE_METERS = 8000;

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function urbanMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext('2d')!;
  const random = seededRandom(219);

  context.fillStyle = '#4b504b';
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < 1024; y += 32) {
    for (let x = 0; x < 1024; x += 32) {
      const green = random() > .86;
      context.fillStyle = green ? '#425343' : ['#716e68', '#77736c', '#64645f'][Math.floor(random() * 3)];
      context.fillRect(x + 2, y + 2, 28, 28);
      if (!green) {
        context.fillStyle = '#504f4b';
        for (let row = 0; row < 4; row++) {
          for (let column = 0; column < 4; column++) {
            context.fillRect(x + 5 + column * 5, y + 5 + row * 5, 3, 3);
          }
        }
      }
    }
  }
  context.fillStyle = '#34383a';
  const center = canvas.width / 2;
  for (let coordinate = 0; coordinate <= canvas.width; coordinate += 32) {
    context.fillRect(coordinate - 1, 0, 2, canvas.height);
    context.fillRect(0, coordinate - 1, canvas.width, 2);
  }
  context.fillRect(center - 2, 0, 4, canvas.height);
  context.fillRect(0, center - 2, canvas.width, 4);
  context.fillStyle = '#8b8b80';
  for (let coordinate = 0; coordinate <= canvas.width; coordinate += 32) {
    context.fillRect(coordinate - 2, 0, 4, canvas.height);
    context.fillRect(0, coordinate - 2, canvas.width, 4);
  }
  context.fillStyle = '#34383a';
  for (let coordinate = 0; coordinate <= canvas.width; coordinate += 32) {
    context.fillRect(coordinate - 1, 0, 2, canvas.height);
    context.fillRect(0, coordinate - 1, canvas.width, 2);
  }
  context.fillStyle = '#ded7bf';
  context.fillRect(center - 1, 0, 2, canvas.height);
  context.fillRect(0, center - 1, canvas.width, 2);
  return canvas;
}

function asphaltTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const grain = Math.sin((x / 512) * Math.PI * 2 * 17) * 5
        + Math.sin((y / 512) * Math.PI * 2 * 23) * 4
        + Math.sin(((x + y) / 512) * Math.PI * 2 * 41) * 3;
      const value = Math.max(0, Math.min(255, 93 + grain));
      const offset = (y * 512 + x) * 4;
      image.data[offset] = value;
      image.data[offset + 1] = value;
      image.data[offset + 2] = value + 2;
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, MAP_SIZE_METERS / 6);
  texture.anisotropy = 8;
  return texture;
}

function sidewalkTexture() {
  const random = seededRandom(713);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#99988f';
  context.fillRect(0, 0, 256, 256);
  context.strokeStyle = '#72736f';
  context.lineWidth = 2;
  for (let y = 0; y <= 256; y += 64) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(256, y); context.stroke();
  }
  for (let x = 0; x <= 256; x += 64) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 256); context.stroke();
  }
  for (let i = 0; i < 900; i++) {
    const x = random() * 256, y = random() * 256;
    context.fillStyle = i % 2 ? '#a6a49a' : '#83827b';
    context.fillRect(x, y, 1, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 8;
  return texture;
}

function facadeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#87837a';
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let floor = 0; floor < 10; floor++) {
    for (let column = 0; column < 5; column++) {
      const x = 13 + column * 48;
      const y = 13 + floor * 49;
      context.fillStyle = '#393f43';
      context.fillRect(x - 2, y - 2, 38, 38);
      context.fillStyle = (floor * 7 + column * 3) % 9 === 0 ? '#d6b77c' : '#648091';
      context.fillRect(x, y, 34, 34);
      context.fillStyle = '#b6b4aa';
      context.fillRect(x + 15, y, 2, 34);
      context.fillRect(x, y + 16, 34, 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function curvedGeometry(width: number, depth: number, centerX: number, centerZ: number, segments = 16) {
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  for (let row = 0; row <= segments; row++) {
    const v = row / segments;
    for (let column = 0; column <= segments; column++) {
      const u = column / segments;
      const x = centerX + (u - .5) * width;
      const z = centerZ + (v - .5) * depth;
      const y = Math.sqrt(EARTH_RADIUS_METERS ** 2 - x * x - z * z) - EARTH_RADIUS_METERS + .004;
      positions.push(x - centerX, y, z - centerZ);
      uvs.push(u, 1 - v);
      if (row < segments && column < segments) {
        const a = row * (segments + 1) + column, b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function tileLevelGroup(level: TexturePyramidLevel) {
  const group = new THREE.Group();
  const tileWidth = MAP_SIZE_METERS / level.columns;
  const tileDepth = MAP_SIZE_METERS / level.rows;
  for (const tile of level.tiles) {
    const centerX = (tile.x + .5) * tileWidth - MAP_SIZE_METERS / 2;
    const centerZ = MAP_SIZE_METERS / 2 - (tile.y + .5) * tileDepth;
    const material = new THREE.MeshStandardMaterial({ map: tile.texture, roughness: 1, metalness: 0, transparent: true, opacity: 1, depthWrite: false });
    const mesh = new THREE.Mesh(curvedGeometry(tileWidth, tileDepth, centerX, centerZ), material);
    mesh.position.set(centerX, 0, centerZ);
    group.add(mesh);
  }
  return group;
}

function addGroundPlane(group: THREE.Group, x: number, z: number, width: number, depth: number, material: THREE.Material, yOffset = .05) {
  const geometry = curvedGeometry(width, depth, x, z, Math.max(8, Math.ceil(depth / 32)));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, yOffset, z);
  group.add(mesh);
  return mesh;
}

function addBuilding(group: THREE.Group, x: number, z: number, width: number, depth: number, height: number, facade: THREE.Texture, tint: number) {
  const groundY = Math.sqrt(EARTH_RADIUS_METERS ** 2 - x * x - z * z) - EARTH_RADIUS_METERS;
  const map = facade.clone();
  map.repeat.set(Math.max(1, width / 9), Math.max(1, height / 12));
  map.needsUpdate = true;
  const material = new THREE.MeshStandardMaterial({ map, color: tint, roughness: .88, metalness: 0 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, groundY + height / 2, z);
  group.add(mesh);
}

function cityMapLevels(master: HTMLCanvasElement) {
  return createTexturePyramid(master, 256, 2).map(tileLevelGroup);
}

function texturesIn(levels: THREE.Group[]) {
  const textures: THREE.Texture[] = [];
  for (const level of levels) {
    level.traverse((object) => {
      const material = (object as THREE.Mesh).material;
      if (material) for (const item of Array.isArray(material) ? material : [material]) {
        const map = (item as THREE.Material & { map?: THREE.Texture }).map;
        if (map) textures.push(map);
      }
    });
  }
  return textures;
}

function disposeTileLevels(levels: THREE.Group[]) {
  for (const level of levels) {
    level.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const materials = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
      for (const material of materials) {
        (material as THREE.Material & { map?: THREE.Texture }).map?.dispose();
        material.dispose();
      }
    });
  }
}

export const cityRenderer: SceneRenderer = {
  kind: 'city',
  cameraDistance: .002,
  create(stop) {
    const group = new THREE.Group();
    const surface = stop.scenePositionKm ?? [0, 6371, 0];
    const up = new THREE.Vector3(...(stop.sceneUp ?? [0, 1, 0])).normalize();
    group.position.set(...surface);
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
    group.scale.setScalar(.001);

    const masterMap = urbanMap();
    const levels = cityMapLevels(masterMap);
    levels.forEach((level, index) => { level.visible = index === 0; group.add(level); });
    group.userData.tileLevels = levels;
    group.userData.worldPosition = group.position.clone();

    const asphalt = asphaltTexture();
    const concrete = sidewalkTexture();
    const facade = facadeTexture();
    group.userData.sharedTextures = [asphalt, concrete, facade, ...texturesIn(levels)];

    const cityImage = new Image();
    cityImage.onload = () => {
      if (group.userData.disposed) return;
      const context = masterMap.getContext('2d');
      if (!context) return;
      context.clearRect(0, 0, masterMap.width, masterMap.height);
      context.drawImage(cityImage, 0, 0, masterMap.width, masterMap.height);
      const replacementLevels = cityMapLevels(masterMap);
      const activeLevel = Number(group.userData.lodDistanceKm ?? 0);
      const previousLevels = group.userData.tileLevels as THREE.Group[];
      previousLevels.forEach((level) => group.remove(level));
      disposeTileLevels(previousLevels);
      group.userData.tileLevels = replacementLevels;
      replacementLevels.forEach((level, index) => {
        level.visible = index === activeLevel;
        group.add(level);
      });
      group.userData.sharedTextures = [asphalt, concrete, facade, ...texturesIn(replacementLevels)];
    };
    cityImage.onerror = () => console.warn('The generated city map could not be loaded; using the built-in fallback map.');
    cityImage.src = cityMasterUrl;

    const roadMaterial = new THREE.MeshStandardMaterial({ map: asphalt, roughness: .96 });
    addGroundPlane(group, 0, 0, 14, MAP_SIZE_METERS, roadMaterial, .08);
    const sidewalkMaterial = new THREE.MeshStandardMaterial({ map: concrete, roughness: 1 });
    for (const side of [-1, 1]) {
      addGroundPlane(group, side * 10, 0, 5, MAP_SIZE_METERS, sidewalkMaterial, .12);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(.3, .16, MAP_SIZE_METERS), new THREE.MeshStandardMaterial({ color: 0xc0bcb0, roughness: 1 }));
      curb.position.set(side * 7.15, .13, 0);
      group.add(curb);
    }

    const marking = new THREE.MeshBasicMaterial({ color: 0xe7e1cd });
    for (let z = -MAP_SIZE_METERS / 2 + 20; z < MAP_SIZE_METERS / 2; z += 26) {
      addGroundPlane(group, 0, z, .14, 8, marking, .16);
    }
    for (let stripe = 0; stripe < 12; stripe++) {
      addGroundPlane(group, -6.5 + stripe * 1.18, -34, .55, 3.5, marking, .17);
    }

    const random = seededRandom(88);
    const facadeMap = facade;
    for (let row = -18; row <= 18; row++) {
      const z = row * 210 + (random() - .5) * 24;
      for (const side of [-1, 1]) {
        const width = 14 + random() * 24;
        const depth = 95 + random() * 70;
        const x = side * (16 + width / 2 + random() * 5);
        const distanceFactor = Math.max(0, 1 - Math.abs(z) / 4200);
        const height = 16 + random() * (54 + 86 * distanceFactor);
        const tint = [0xaaa59b, 0x8b877f, 0xb3aaa0, 0x777b7e][Math.floor(random() * 4)];
        addBuilding(group, x, z, width, depth, height, facadeMap, tint);
      }
    }

    for (const side of [-1, 1]) {
      for (let z = -3200; z <= 3200; z += 400) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(.08, .12, 7, 6),
          new THREE.MeshStandardMaterial({ color: 0x34383b, roughness: .7 })
        );
        post.position.set(side * 12.7, 3.5, z);
        group.add(post);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf4dda3 }));
        lamp.position.set(side * 12.7, 7.1, z);
        group.add(lamp);
      }
    }

    const vehicles = [
      { x: -3.8, z: -58, color: 0x9aa2a5 },
      { x: 3.8, z: -132, color: 0x242a30 },
      { x: -3.8, z: 84, color: 0x546570 },
    ];
    for (const vehicle of vehicles) {
      const car = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.35, 4.4), new THREE.MeshStandardMaterial({ color: vehicle.color, roughness: .45, metalness: .16 }));
      car.position.set(vehicle.x, .9, vehicle.z);
      group.add(car);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.45, .55, 2), new THREE.MeshStandardMaterial({ color: 0x87939a, roughness: .35, metalness: .1 }));
      roof.position.set(vehicle.x, 1.78, vehicle.z - .2);
      group.add(roof);
    }

    const sunlight = new THREE.DirectionalLight(0xffe3c0, 2.1);
    sunlight.position.set(-12000, 18000, 8000);
    group.add(sunlight);
    group.add(new THREE.AmbientLight(0x8799b2, .55));

    const streetDetails = new THREE.Group();
    const tileLayers = new Set(levels);
    for (const child of [...group.children]) {
      if (!tileLayers.has(child as THREE.Group)) {
        group.remove(child);
        streetDetails.add(child);
      }
    }
    group.add(streetDetails);
    group.userData.streetDetails = streetDetails;

    const photoMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 1, depthWrite: false, toneMapped: false });
    const photoSphere = new THREE.Mesh(new THREE.SphereGeometry(2000, 96, 64), photoMaterial);
    photoSphere.rotation.y = Math.PI;
    photoSphere.renderOrder = 2;
    group.add(photoSphere);
    photoSphere.visible = false;
    new THREE.TextureLoader().load(cityStreetPanoramaUrl, (texture) => {
      if (group.userData.disposed) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      photoMaterial.map = texture;
      photoMaterial.needsUpdate = true;
      photoSphere.visible = true;
      group.userData.panoramaReady = true;
      const canvas = document.querySelector<HTMLCanvasElement>('#universe');
      if (canvas) canvas.dataset.panoramaStatus = 'loaded';
      (group.userData.sharedTextures as THREE.Texture[]).push(texture);
    }, undefined, () => {
      const canvas = document.querySelector<HTMLCanvasElement>('#universe');
      if (canvas) canvas.dataset.panoramaStatus = 'error';
      console.error('The street panorama failed to load from ' + cityStreetPanoramaUrl);
    });
    group.userData.photoSphere = photoSphere;
    group.userData.lodDistanceKm = 0;
    return group;
  },
  update(group, _elapsed, context) {
    const cityCenter = group.userData.worldPosition as THREE.Vector3;
    const altitudeKm = context ? context.cameraWorldPosition.distanceTo(cityCenter) : 0;
    const level = altitudeKm < .5 ? 0 : altitudeKm < 2.5 ? 1 : 2;
    const streetDetails = group.userData.streetDetails as THREE.Group;
    const photoOpacity = 1 - THREE.MathUtils.smoothstep(altitudeKm, .04, .2);
    const photoSphere = group.userData.photoSphere as THREE.Mesh;
    (photoSphere.material as THREE.MeshBasicMaterial).opacity = photoOpacity;
    photoSphere.visible = photoOpacity > .001 && Boolean(group.userData.panoramaReady);
    streetDetails.visible = (altitudeKm > .04 && altitudeKm < .2) || (!group.userData.panoramaReady && altitudeKm < 4);
    const levels = group.userData.tileLevels as THREE.Group[];
    levels.forEach((item, index) => { item.visible = index === level && altitudeKm >= .04; });
    group.userData.lodDistanceKm = level;
    const tileOpacity = THREE.MathUtils.smoothstep(altitudeKm, .04, .2);
    for (const tileLevel of levels) {
      tileLevel.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.material) return;
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          (material as THREE.MeshStandardMaterial).opacity = tileOpacity;
        }
      });
    }
  },
};
