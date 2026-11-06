import * as THREE from 'three';

export interface ZoomFrame {
  filename: string;
  widthMeters: number;
}

// The final 387,420 km Earth frame is intentionally omitted: the saved image
// made the planet appear too distant before the lunar arrival.
export const earthZoomFrames: ZoomFrame[] = [
  { filename: 'road-seed-1m.png', widthMeters: 1 },
  { filename: 'road-composite-3m-harmonized.png', widthMeters: 3 },
  ...[9, 27, 81, 243, 729, 2187, 6561, 19683, 59049, 177147, 531441, 1594323, 4782969, 14348907, 43046721, 129140163].map((widthMeters) => ({
    filename: `road-composite-${widthMeters}m.png`, widthMeters,
  })),
];

export const earthZoomArtIndexByStop = [0, 3, 6, 9, 12, 17] as const;

function assetUrl(filename: string) {
  const optimizedName = `${filename.replace(/\.png$/i, '')}.webp`;
  return new URL(`assets/road-zoom-pilot/optimized/${optimizedName}`, document.baseURI).href;
}

function clamp01(value: number) { return THREE.MathUtils.clamp(value, 0, 1); }
function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

export class DeepZoomArtwork {
  private readonly root: HTMLDivElement;
  private readonly back: HTMLImageElement;
  private readonly front: HTMLImageElement;
  private readonly moon: HTMLImageElement;
  private lastBack = '';
  private lastFront = '';
  private lastMoon = '';
  private readonly pending = new Map<string, Promise<void>>();

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'deep-zoom-artwork';
    this.root.setAttribute('aria-hidden', 'true');
    this.back = this.createLayer('zoom-back');
    this.front = this.createLayer('zoom-front');
    this.moon = this.createLayer('moon-arrival');
    parent.prepend(this.root);
    this.preload(assetUrl(earthZoomFrames[0].filename));
    this.showEarthFrame(0);
  }

  private createLayer(className: string) {
    const image = document.createElement('img');
    image.className = `zoom-layer ${className}`;
    image.alt = '';
    image.draggable = false;
    this.root.append(image);
    return image;
  }

  private preload(src: string) {
    const existing = this.pending.get(src);
    if (existing) return existing;
    const image = new Image();
    const loaded = new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
    });
    image.src = src;
    this.pending.set(src, loaded);
    return loaded;
  }

  prepareTransition(fromIndex: number, toIndex: number, includeMoon = false) {
    const lower = Math.min(fromIndex, toIndex);
    const upper = Math.max(fromIndex, toIndex);
    const requests = earthZoomFrames.slice(lower, upper + 1).map((frame) => this.preload(assetUrl(frame.filename)));
    if (includeMoon) requests.push(this.preload(assetUrl('moon-surface-earth-view.png')));
    return Promise.all(requests);
  }

  private setImage(image: HTMLImageElement, src: string, which: 'back' | 'front' | 'moon') {
    if (which === 'back' && this.lastBack !== src) { image.src = src; this.lastBack = src; }
    if (which === 'front' && this.lastFront !== src) { image.src = src; this.lastFront = src; }
    if (which === 'moon' && this.lastMoon !== src) { image.src = src; this.lastMoon = src; }
  }

  private transform(image: HTMLImageElement, scale: number, opacity: number) {
    image.style.transform = `scale(${scale})`;
    image.style.opacity = String(clamp01(opacity));
  }

  showEarthFrame(index: number) {
    const frame = earthZoomFrames[THREE.MathUtils.clamp(Math.round(index), 0, earthZoomFrames.length - 1)];
    const src = assetUrl(frame.filename);
    this.setImage(this.back, src, 'back');
    this.setImage(this.front, src, 'front');
    this.transform(this.back, 1, 1);
    this.transform(this.front, 1, 0);
    this.transform(this.moon, 1, 0);
  }

  /** Render a factor-of-three image handoff; the central tile remains registered throughout. */
  showEarthTransition(fromIndex: number, toIndex: number, progress: number) {
    const p = clamp01(progress);
    const index = THREE.MathUtils.clamp(fromIndex + (toIndex - fromIndex) * p, 0, earthZoomFrames.length - 1);
    if (toIndex >= fromIndex) {
      const lower = Math.floor(index);
      const upper = Math.min(earthZoomFrames.length - 1, lower + 1);
      const local = upper === lower ? 0 : index - lower;
      this.setImage(this.front, assetUrl(earthZoomFrames[lower].filename), 'front');
      this.transform(this.front, 1 - (2 / 3) * local, 1);
      if (upper === lower) {
        this.transform(this.back, 1, 0);
      } else {
        this.setImage(this.back, assetUrl(earthZoomFrames[upper].filename), 'back');
        this.transform(this.back, 3 - 2 * local, 1);
      }
    } else {
      const upper = Math.ceil(index);
      const lower = Math.max(0, upper - 1);
      const local = upper === lower ? 0 : upper - index;
      this.setImage(this.back, assetUrl(earthZoomFrames[upper].filename), 'back');
      this.transform(this.back, 1 + 2 * local, 1);
      if (upper === lower) {
        this.transform(this.front, 1, 0);
        this.transform(this.moon, 1, 0);
        return;
      }
      this.setImage(this.front, assetUrl(earthZoomFrames[lower].filename), 'front');
      this.transform(this.front, 1 / 3 + (2 / 3) * local, 1);
    }
    this.transform(this.moon, 1, 0);
  }

  /** The lunar handoff zooms away from Earth, then grows the saved surface view into frame. */
  showLunarArrival(earthFrameIndex: number, progress: number) {
    const p = clamp01(progress);
    const earthScale = 1 - .92 * smoothstep(0, .43, p);
    const earthOpacity = 1 - smoothstep(.22, .48, p);
    const moonProgress = smoothstep(.69, 1, p);
    this.setImage(this.back, assetUrl(earthZoomFrames[earthFrameIndex].filename), 'back');
    this.transform(this.back, earthScale, earthOpacity);
    this.transform(this.front, 1, 0);
    this.setImage(this.moon, assetUrl('moon-surface-earth-view.png'), 'moon');
    this.transform(this.moon, .14 + .86 * moonProgress, smoothstep(.69, .82, p));
  }

  showLunarDeparture(targetEarthFrameIndex: number, progress: number) {
    const p = clamp01(progress);
    const handoff = .5;
    if (p <= handoff) {
      this.showLunarArrival(earthZoomFrames.length - 1, 1 - p / handoff);
      return;
    }
    this.showEarthTransition(earthZoomFrames.length - 1, targetEarthFrameIndex, (p - handoff) / (1 - handoff));
  }

  frameIndexAt(fromIndex: number, toIndex: number, progress: number) {
    return THREE.MathUtils.clamp(fromIndex + (toIndex - fromIndex) * clamp01(progress), 0, earthZoomFrames.length - 1);
  }

  labelAt(index: number) {
    const frame = earthZoomFrames[Math.round(THREE.MathUtils.clamp(index, 0, earthZoomFrames.length - 1))];
    const width = frame.widthMeters;
    const km = width / 1000;
    const formattedKm = km >= 100 ? Math.round(km).toLocaleString() : km.toLocaleString(undefined, { maximumSignificantDigits: 3 });
    const value = width < 1000 ? `${width} m` : `${formattedKm} km`;
    return `View width · ${value}`;
  }
}
