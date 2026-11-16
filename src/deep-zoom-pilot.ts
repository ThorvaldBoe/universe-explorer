import OpenSeadragon from 'openseadragon';
import './style.css';

const script = document.querySelector<HTMLScriptElement>('script[src="/universe-explorer/version-selector.js"]');
const siteBase = script ? new URL('./', script.src) : new URL('./', window.location.href);
const viewerElement = document.querySelector<HTMLElement>('#deep-zoom-viewer')!;
const status = document.querySelector<HTMLElement>('#viewer-status')!;
const scaleLabel = document.querySelector<HTMLElement>('#pilot-scale-label')!;
const pullBack = document.querySelector<HTMLButtonElement>('#zoom-out')!;
const reset = document.querySelector<HTMLButtonElement>('#reset-view')!;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const viewer = OpenSeadragon({
  element: viewerElement,
  tileSources: new URL('assets/deep-zoom-pilot/road-composite.dzi', siteBase).href,
  showNavigationControl: false,
  showNavigator: false,
  showFullPageControl: false,
  showHomeControl: false,
  showZoomControl: false,
  animationTime: reducedMotion ? 0 : 2.8,
  blendTime: 0,
  maxZoomPixelRatio: 4,
  visibilityRatio: 1,
  minZoomImageRatio: 1,
  gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: false, flickEnabled: false },
  gestureSettingsTouch: { pinchToZoom: false, flickEnabled: false },
  gestureSettingsPen: { clickToZoom: false, dblClickToZoom: false, flickEnabled: false },
  gestureSettingsUnknown: { clickToZoom: false, dblClickToZoom: false, flickEnabled: false },
});

let isPulledBack = false;
viewer.addHandler('open', () => {
  const center = viewer.viewport.getCenter(true);
  viewer.viewport.zoomTo(viewer.viewport.getZoom(true) * 3, center, true);
  viewer.viewport.applyConstraints(true);
  status.hidden = true;
  document.querySelectorAll<HTMLButtonElement>('.pilot-button, .pilot-reset').forEach((button) => { button.disabled = false; });
});
viewer.addHandler('animation-finish', () => {
  const centerZoom = viewer.viewport.getZoom(true);
  const baseZoom = viewer.viewport.getHomeZoom();
  isPulledBack = centerZoom < baseZoom * 1.5;
  scaleLabel.textContent = isPulledBack ? 'VIEW WIDTH · 3 M' : 'VIEW WIDTH · 1 M';
  pullBack.innerHTML = isPulledBack ? 'Zoom into road <span aria-hidden="true">↑</span>' : 'Pull back to 3 m <span aria-hidden="true">↓</span>';
});

pullBack.disabled = true;
reset.disabled = true;
pullBack.addEventListener('click', () => {
  const factor = isPulledBack ? 3 : 1 / 3;
  viewer.viewport.zoomBy(factor, viewer.viewport.getCenter(true));
  viewer.viewport.applyConstraints();
});
reset.addEventListener('click', () => {
  const center = viewer.viewport.getCenter(true);
  viewer.viewport.zoomTo(viewer.viewport.getHomeZoom() * 3, center);
  viewer.viewport.applyConstraints();
  isPulledBack = false;
});
