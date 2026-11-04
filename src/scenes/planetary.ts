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
function body(radius: number, color: number) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), new THREE.MeshStandardMaterial({ color, roughness: .9 }));
}

export const planetaryRenderer: SceneRenderer = {
  kind: 'planetary',
  cameraDistance: 9,
  create(stop) {
    const group = new THREE.Group();
    if (stop.id === 'earth') {
      const earth = new THREE.Mesh(new THREE.SphereGeometry(2.05, 96, 64), new THREE.MeshPhysicalMaterial({ map: earthMap(), roughness: .92, metalness: 0, clearcoat: .08 }));
      earth.position.set(.8, -1, 0); group.add(earth);
      const clouds = new THREE.Mesh(new THREE.SphereGeometry(2.075, 96, 64), new THREE.MeshStandardMaterial({ map: cloudMap(), transparent: true, opacity: .52, roughness: 1, depthWrite: false }));
      clouds.position.copy(earth.position); group.add(clouds);
      const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.13, 64, 48), new THREE.MeshBasicMaterial({ color: 0x63baff, transparent: true, opacity: .16, side: THREE.BackSide, depthWrite: false }));
      atmosphere.position.copy(earth.position); group.add(atmosphere);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(2.23, 64, 48), new THREE.MeshBasicMaterial({ color: 0x3588e5, transparent: true, opacity: .075, side: THREE.BackSide, depthWrite: false }));
      halo.position.copy(earth.position); group.add(halo);
      const light = new THREE.DirectionalLight(0xffe1b2, 3.1); light.position.set(-4, 3, 5); group.add(light);
      group.add(new THREE.AmbientLight(0x8399bd, .38));
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
