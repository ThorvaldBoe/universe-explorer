import OpenSeadragon from 'openseadragon';
import './style.css';

const script = document.querySelector<HTMLScriptElement>('script[src="/universe-explorer/version-selector.js"]');
const siteBase = script ? new URL('./', script.src) : new URL('./', window.location.href);
const viewerElement = document.querySelector<HTMLElement>('#city-zoom-viewer')!;
const status = document.querySelector<HTMLElement>('#city-viewer-status')!;
const scaleLabel = document.querySelector<HTMLElement>('#city-scale-label')!;
const toggle = document.querySelector<HTMLButtonElement>('#city-zoom-toggle')!;
const reset = document.querySelector<HTMLButtonElement>('#city-reset')!;
const scrubber = document.querySelector<HTMLInputElement>('#city-zoom-range')!;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const viewer = OpenSeadragon({
  element: viewerElement,
  tileSources: new URL('assets/v3-city-pilot/81m-city.dzi', siteBase).href,
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

let homeZoom = 0;
let detailLayer: OpenSeadragon.TiledImage | null = null;
let closeUpProgress = 1;

function clamp01(value: number) { return Math.min(1, Math.max(0, value)); }
function progressFromZoom() {
  if (!homeZoom) return 1;
  const ratio = viewer.viewport.getZoom(true) / homeZoom;
  return clamp01((ratio - 1) / 2);
}

function updateReadout(progress = progressFromZoom()) {
  closeUpProgress = progress;
  // The 27 m source only replaces the 81 m crop at the final close-up frame.
  // This isolates the exact scale handoff without exposing a mismatched tile edge mid-zoom.
  detailLayer?.setOpacity(progress >= .999 ? 1 : 0);
  const viewWidth = 81 / (1 + 2 * progress);
  scaleLabel.textContent = `VIEW WIDTH · ${Math.round(viewWidth)} M`;
  scrubber.value = String(Math.round(progress * 1000));
  toggle.textContent = progress > .5 ? 'Pull back to 81 m ↓' : 'Return to 27 m ↑';
}

function zoomToProgress(progress: number, immediate = false) {
  if (!homeZoom) return;
  const p = clamp01(progress);
  viewer.viewport.zoomTo(homeZoom * (1 + 2 * p), viewer.viewport.getCenter(true), immediate);
  viewer.viewport.applyConstraints(immediate);
  updateReadout(p);
}

viewer.addHandler('open', () => {
  homeZoom = viewer.viewport.getHomeZoom();
  const detailUrl = new URL('assets/road-zoom-pilot/road-composite-27m.png', siteBase).href;
  viewer.addTiledImage({
    tileSource: new OpenSeadragon.ImageTileSource({ url: detailUrl, buildPyramid: true }),
    x: 1 / 3,
    y: 1 / 3,
    width: 1 / 3,
    opacity: 1,
    success: () => {
      detailLayer = viewer.world.getItemAt(1);
      detailLayer.setOpacity(1);
      zoomToProgress(1, true);
      status.hidden = true;
      toggle.disabled = false;
      reset.disabled = false;
      scrubber.disabled = false;
    },
    error: () => {
      status.textContent = 'The 27 m detail image could not be loaded.';
    },
  });
});

viewer.addHandler('animation', () => updateReadout());
viewer.addHandler('animation-finish', () => updateReadout());

toggle.addEventListener('click', () => {
  zoomToProgress(closeUpProgress > .5 ? 0 : 1, reducedMotion);
});

reset.addEventListener('click', () => zoomToProgress(1, reducedMotion));

scrubber.addEventListener('input', () => {
  zoomToProgress(Number(scrubber.value) / 1000, true);
});
