import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import './style.css';

const viewerElement = document.querySelector<HTMLElement>('#cesium-viewer')!;
const status = document.querySelector<HTMLElement>('#cesium-viewer-status')!;
const scaleLabel = document.querySelector<HTMLElement>('#cesium-scale-label')!;
const toggle = document.querySelector<HTMLButtonElement>('#cesium-zoom-toggle')!;
const reset = document.querySelector<HTMLButtonElement>('#cesium-reset')!;
const scrubber = document.querySelector<HTMLInputElement>('#cesium-zoom-range')!;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
Cesium.Ion.defaultAccessToken = '';

const center = { longitude: 7.7182754, latitude: 63.1249251 };
const minimumWidth = 27;
const maximumWidth = 81;
const viewer = new Cesium.Viewer(viewerElement, {
  animation: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  navigationHelpButton: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  fullscreenButton: false,
  vrButton: false,
  baseLayer: false,
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  requestRenderMode: true,
  maximumRenderTimeChange: Infinity,
});

viewer.scene.globe.show = true;
viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#131c29');
if (viewer.scene.skyBox) viewer.scene.skyBox.show = false;
if (viewer.scene.sun) viewer.scene.sun.show = false;
if (viewer.scene.moon) viewer.scene.moon.show = false;
viewer.scene.screenSpaceCameraController.enableTilt = false;
viewer.scene.screenSpaceCameraController.enableRotate = false;
viewer.scene.screenSpaceCameraController.enableLook = false;
viewer.scene.screenSpaceCameraController.enableTranslate = false;
viewer.scene.screenSpaceCameraController.enableZoom = false;

const imagery = viewer.imageryLayers.addImageryProvider(new Cesium.OpenStreetMapImageryProvider({
  url: 'https://tile.openstreetmap.org/',
  credit: '© OpenStreetMap contributors',
}));
imagery.alpha = 1;

function setWidth(width: number, animate = false) {
  const fieldOfView = viewer.camera.frustum instanceof Cesium.PerspectiveFrustum
    ? viewer.camera.frustum.fovy ?? Cesium.Math.toRadians(60)
    : Cesium.Math.toRadians(60);
  const altitude = (width / 2) / Math.tan(fieldOfView / 2);
  const destination = Cesium.Cartesian3.fromDegrees(center.longitude, center.latitude, altitude);
  if (animate && !reducedMotion) {
    viewer.camera.flyTo({
      destination,
      orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
      duration: 1.4,
      complete: () => viewer.scene.requestRender(),
    });
  } else {
    viewer.camera.setView({
      destination,
      orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
    });
  }
  scaleLabel.textContent = `VIEW WIDTH · ${Math.round(width)} M`;
}

function widthForProgress(progress: number) {
  return maximumWidth * Math.pow(minimumWidth / maximumWidth, progress);
}

function update(progress: number, animate = false) {
  const bounded = Math.min(1, Math.max(0, progress));
  setWidth(widthForProgress(bounded), animate);
  scrubber.value = String(Math.round(bounded * 1000));
  toggle.textContent = bounded > .5 ? 'Pull back to 81 m ↓' : 'Zoom into 27 m ↑';
}

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(center.longitude, center.latitude, 300),
  orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
});

let tilesReady = false;
viewer.scene.globe.tileLoadProgressEvent.addEventListener((remaining) => {
  if (remaining !== 0 || tilesReady) return;
  tilesReady = true;
  status.hidden = true;
  toggle.disabled = false;
  reset.disabled = false;
  scrubber.disabled = false;
  update(0);
});

toggle.addEventListener('click', () => {
  update(Number(scrubber.value) > 500 ? 0 : 1, true);
});
reset.addEventListener('click', () => update(0));
scrubber.addEventListener('input', () => update(Number(scrubber.value) / 1000));

window.addEventListener('resize', () => viewer.resize());
