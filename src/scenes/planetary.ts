import * as THREE from 'three';
import type { SceneRenderer } from './types';

const planetColors = [0xaca7a0, 0xd89e73, 0x648cc8, 0xb5a486, 0xd5b68b, 0x82c6c9, 0x4f77d8, 0x747fd1];
const names = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const distancesAu = [.39, .72, 1, 1.52, 5.2, 9.58, 19.2, 30.05];
const radiiKm = [2439.7, 6051.8, 6371, 3389.5, 69911, 58232, 25362, 24622];
const AU_KM = 149_597_870.7;
const EARTH_RADIUS_KM = 6371;


function label(text: string, position: THREE.Vector3, color = '#dce8ff') {
  const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 64;
  const context = canvas.getContext('2d')!; context.font = '26px system-ui'; context.fillStyle = color; context.fillText(text, 8, 42);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }));
  sprite.position.copy(position); sprite.scale.set(2.5, .5, 1); return sprite;
}
function earthMap() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const c = canvas.getContext('2d')!;
  const ocean = c.createLinearGradient(0, 0, 0, 512);
  ocean.addColorStop(0, '#123d69'); ocean.addColorStop(.5, '#17649a'); ocean.addColorStop(1, '#092b54');
  c.fillStyle = ocean; c.fillRect(0, 0, 1024, 512);
  const land = [[[95,80],[145,53],[190,60],[215,84],[247,89],[258,116],[238,141],[218,150],[205,183],[178,190],[162,214],[142,204],[132,179],[111,166],[97,135],[78,113]],[[230,205],[257,218],[268,247],[258,279],[272,300],[260,333],[249,363],[232,397],[216,382],[211,350],[197,324],[202,291],[190,270],[201,239]],[[433,135],[466,130],[491,147],[508,174],[500,206],[481,227],[473,262],[455,290],[435,277],[422,247],[412,219],[419,192],[405,164]],[[493,102],[534,83],[578,74],[611,89],[644,86],[680,105],[704,132],[695,160],[670,169],[651,155],[626,170],[605,160],[582,173],[560,156],[535,165],[511,145]],[[657,224],[686,214],[715,230],[731,250],[715,270],[686,276],[663,259]],[[759,300],[790,286],[824,297],[840,318],[819,336],[788,333],[767,319]]];
  c.fillStyle = '#63875f'; c.strokeStyle = '#9eaa76'; c.lineWidth = 3;
  for (const points of land) { c.beginPath(); c.moveTo(points[0][0], points[0][1]); for (const [x,y] of points.slice(1)) c.lineTo(x,y); c.closePath(); c.fill(); c.stroke(); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}
function cloudMap() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512; const c = canvas.getContext('2d')!;
  let seed = 73; const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 280; i++) { const x = random()*1024, y = random()*512, w = 18+random()*80, h = 3+random()*10; c.fillStyle = 'rgba(235,244,255,' + (.025+random()*.08) + ')'; c.beginPath(); c.ellipse(x,y,w,h,0,0,Math.PI*2); c.fill(); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}
function terrainNoise(x: number, z: number, scale: number) {
  const ix = Math.floor(x * scale), iz = Math.floor(z * scale);
  const fx0 = x * scale - ix, fz0 = z * scale - iz;
  const fx = fx0 * fx0 * (3 - 2 * fx0), fz = fz0 * fz0 * (3 - 2 * fz0);
  const hash = (a: number, b: number) => {
    const value = Math.sin(a * 127.1 + b * 311.7 + scale * 74.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const north = THREE.MathUtils.lerp(hash(ix, iz), hash(ix + 1, iz), fx);
  const south = THREE.MathUtils.lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), fx);
  return THREE.MathUtils.lerp(north, south, fz);
}
function terrainTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
  const context = canvas.getContext('2d')!;
  const pixels = context.createImageData(canvas.width, canvas.height);
  for (let py = 0; py < canvas.height; py++) {
    const z = (py / (canvas.height - 1) - .5) * 24;
    for (let px = 0; px < canvas.width; px++) {
      const x = (px / (canvas.width - 1) - .5) * 24;
      const broad = terrainNoise(x, z, .42);
      const medium = terrainNoise(x + 19, z - 7, 1.8);
      const small = terrainNoise(x - 4, z + 29, 8);
      const detail = terrainNoise(x + 61, z + 11, 38);
      const moisture = terrainNoise(x - 43, z + 17, .8);
      const elevation = broad * .52 + medium * .3 + small * .18;
      const dryness = .45 * broad + .35 * moisture + .2 * medium;
      const forest = THREE.MathUtils.smoothstep(dryness, .36, .72);
      const rock = THREE.MathUtils.smoothstep(elevation, .68, .9) * .48;
      const grass = [112 + medium * 48, 116 + moisture * 52, 62 + broad * 34];
      const woodland = [32 + small * 42, 82 + moisture * 58, 35 + broad * 30];
      const stone = [132 + detail * 54, 119 + detail * 48, 98 + detail * 42];
      const grain = (detail - .5) * 28;
      const offset = (py * canvas.width + px) * 4;
      for (let channel = 0; channel < 3; channel++) {
        const greenValue = THREE.MathUtils.lerp(grass[channel], woodland[channel], forest);
        pixels.data[offset + channel] = Math.round(THREE.MathUtils.lerp(greenValue + grain, stone[channel] + grain, rock));
      }
      pixels.data[offset + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
function earthTerrain() {
  const size = 12, segments = 384;
  const positions: number[] = [], colors: number[] = [], uvs: number[] = [], indices: number[] = [];
  const color = new THREE.Color();
  for (let row = 0; row <= segments; row++) {
    const z = (row / segments * 2 - 1) * size;
    for (let col = 0; col <= segments; col++) {
      const x = (col / segments * 2 - 1) * size;
      const radius = Math.sqrt(x * x + z * z);
      const fade = Math.max(0, 1 - radius / size);
      const terrainNoise = Math.sin(x * .8 + z * .17) * .44 + Math.sin(z * 1.3 - x * .31) * .34 + Math.sin(x * 3.1 + z * 2.7) * .22;
      const terrain = Math.max(0, .018 + terrainNoise * .009) * fade * THREE.MathUtils.smoothstep(radius, 0, 1.2);
      const surface = Math.sqrt(Math.max(0, EARTH_RADIUS_KM ** 2 - radius ** 2));
      positions.push(x, surface + .001 + terrain, z);
      const shade = .96 + terrainNoise * .035;
      color.setRGB(shade, shade, shade);
      colors.push(color.r, color.g, color.b);
      uvs.push(col / segments, row / segments);
      if (row < segments && col < segments) {
        const a = row * (segments + 1) + col, b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    map: terrainTexture(), vertexColors: true, roughness: .96, side: THREE.DoubleSide
  }));
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
      const earthMaterial = new THREE.MeshPhysicalMaterial({ map: earthMap(), roughness: .92, metalness: 0, clearcoat: .08 });
      new THREE.TextureLoader().load(new URL('textures/earth-blue-marble.jpg', document.baseURI).toString(), (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
        earthMaterial.map?.dispose(); earthMaterial.map = texture; earthMaterial.needsUpdate = true;
      });
      const earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS_KM, 128, 96), earthMaterial);
      group.add(earth);
      group.add(earthTerrain());
      group.userData.stopId = 'earth';
      const clouds = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS_KM + 22, 96, 64), new THREE.MeshStandardMaterial({
        map: cloudMap(), transparent: true, opacity: .24, roughness: 1, depthWrite: false
      }));
      group.add(clouds);
      group.add(new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS_KM + 90, 64, 48), new THREE.ShaderMaterial({
        side: THREE.BackSide, transparent: true, depthWrite: false,
        vertexShader: [
          'varying vec3 vWorldPosition;',
          'varying vec3 vPlanetCenter;',
          'void main() { vec4 world = modelMatrix * vec4(position, 1.0); vWorldPosition = world.xyz; vPlanetCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * world; }'
        ].join('\n'),
        fragmentShader: [
          'varying vec3 vWorldPosition;',
          'varying vec3 vPlanetCenter;',
          'void main() { vec3 ray = normalize(vWorldPosition - cameraPosition); vec3 normal = normalize(vWorldPosition - vPlanetCenter); float elevation = max(0.0, dot(ray, normal)); vec3 horizon = vec3(0.20, 0.49, 0.78); vec3 zenith = vec3(0.015, 0.035, 0.10); vec3 sky = mix(horizon, zenith, smoothstep(0.0, 0.85, elevation)); gl_FragColor = vec4(sky, 0.76); }'
        ].join('\n')
      })));
      const light = new THREE.DirectionalLight(0xffe1b2, 2.5); light.position.set(-12000, 18000, 24000); group.add(light);
      group.add(new THREE.AmbientLight(0x8399bd, .38));
      return group;
    }

    group.add(new THREE.AmbientLight(0x98aeda, .7));
    const sunPosition = new THREE.Vector3(-AU_KM, 0, 0);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(696340, 48, 32), new THREE.MeshBasicMaterial({ color: 0xffc963 }));
    sun.position.copy(sunPosition); group.add(sun);
    const sunlight = new THREE.PointLight(0xffd386, 2.2, 0, 2); sunlight.position.copy(sunPosition); group.add(sunlight);
    const markerPositions: number[] = [], markerColors: number[] = [];
    const markerColor = new THREE.Color();
    const angles = [1.8, 3.6, 0, .5, 2.2, 4.2, .2, 2.8];
    for (let i = 0; i < distancesAu.length; i++) {
      const distance = distancesAu[i] * AU_KM;
      const orbit = new THREE.Mesh(
        new THREE.RingGeometry(distance * .9997, distance * 1.0003, 192),
        new THREE.MeshBasicMaterial({ color: 0x8396b6, transparent: true, opacity: .26, side: THREE.DoubleSide, depthWrite: false })
      );
      orbit.position.copy(sunPosition); group.add(orbit);
      const position = new THREE.Vector3(
        sunPosition.x + Math.cos(angles[i]) * distance,
        Math.sin(angles[i]) * distance,
        0
      );
      if (i !== 2) {
        const planet = body(radiiKm[i], planetColors[i]);
        planet.position.copy(position); group.add(planet);
      }
      markerPositions.push(position.x, position.y, position.z);
      markerColor.setHex(planetColors[i]); markerColors.push(markerColor.r, markerColor.g, markerColor.b);
    }
    const markers = new THREE.BufferGeometry();
    markers.setAttribute('position', new THREE.Float32BufferAttribute(markerPositions, 3));
    markers.setAttribute('color', new THREE.Float32BufferAttribute(markerColors, 3));
    group.add(new THREE.Points(markers, new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, vertexColors: true, depthWrite: false })));
    return group;
  },
  update(group, elapsed) {
    if (group.userData.stopId === 'earth') {
      group.rotation.y = elapsed * .004;
    }
  },
};
