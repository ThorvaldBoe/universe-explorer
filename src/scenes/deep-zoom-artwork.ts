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
  private readonly moonSky: HTMLImageElement;
  private readonly moonGround: HTMLImageElement;
  private lastBack = '';
  private lastFront = '';
  private lastMoonSky = '';
  private lastMoonGround = '';
  private readonly pending = new Map<string, Promise<void>>();

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'deep-zoom-artwork';
    this.root.setAttribute('aria-hidden', 'true');
    this.back = this.createLayer('zoom-back');
    this.front = this.createLayer('zoom-front');
    this.moonSky = this.createLayer('moon-sky');
    this.moonGround = this.createLayer('moon-ground');
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

  private setImage(image: HTMLImageElement, src: string, which: 'back' | 'front' | 'moonSky' | 'moonGround') {
    if (which === 'back' && this.lastBack !== src) { image.src = src; this.lastBack = src; }
    if (which === 'front' && this.lastFront !== src) { image.src = src; this.lastFront = src; }
    if (which === 'moonSky' && this.lastMoonSky !== src) { image.src = src; this.lastMoonSky = src; }
    if (which === 'moonGround' && this.lastMoonGround !== src) { image.src = src; this.lastMoonGround = src; }
  }

  private transform(image: HTMLImageElement, scale: number, opacity: number, x = 0, y = 0) {
    image.style.transform = `translate(${x}%, ${y}%) scale(${scale})`;
    image.style.opacity = String(clamp01(opacity));
  }

  setOpacity(opacity: number) {
    this.root.style.opacity = String(clamp01(opacity));
  }

  showEarthFrame(index: number) {
    this.setOpacity(1);
    const frame = earthZoomFrames[THREE.MathUtils.clamp(Math.round(index), 0, earthZoomFrames.length - 1)];
    const src = assetUrl(frame.filename);
    this.setImage(this.back, src, 'back');
    this.setImage(this.front, src, 'front');
    this.transform(this.back, 1, 1);
    this.transform(this.front, 1, 0);
    this.transform(this.moonSky, 1, 0);
    this.transform(this.moonGround, 1, 0);
    this.moonSky.style.clipPath = 'inset(0 0 0 0)';
    this.moonGround.style.clipPath = 'inset(0 0 0 0)';
    this.moonGround.style.transformOrigin = '';
    this.root.style.background = 'transparent';
  }

  /** Render a factor-of-three image handoff; the central tile remains registered throughout. */
  showEarthTransition(fromIndex: number, toIndex: number, progress: number) {
    this.setOpacity(1);
    const p = clamp01(progress);
    this.root.style.background = 'transparent';
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
        this.transform(this.moonSky, 1, 0);
        this.transform(this.moonGround, 1, 0);
        return;
      }
      this.setImage(this.front, assetUrl(earthZoomFrames[lower].filename), 'front');
      this.transform(this.front, 1 / 3 + (2 / 3) * local, 1);
    }
    this.transform(this.moonSky, 1, 0);
    this.transform(this.moonGround, 1, 0);
  }

  /** Keep Earth registered while the lunar surface approaches beneath it. */
  showLunarArrival(earthFrameIndex: number, progress: number) {
    const p = clamp01(progress);
    // The last Earth frame's disk is about 9.5% of its width; at 24% image scale
    // it matches the ~2.3% Earth disk in the Moon artwork. Translate it to that
    // artwork's final screen position before crossfading the sky layer.
    const earthHandoff = smoothstep(0, .66, p);
    const earthScale = 1 - .76 * earthHandoff;
    const earthOpacity = 1 - smoothstep(.72, .9, p);
    const earthX = 19 * earthHandoff;
    const earthY = -30 * earthHandoff;
    const skyOpacity = smoothstep(.66, .88, p);
    const groundProgress = smoothstep(.2, 1, p);
    const groundScale = .62 + .38 * groundProgress;
    this.setImage(this.back, assetUrl(earthZoomFrames[earthFrameIndex].filename), 'back');
    this.transform(this.back, earthScale, earthOpacity, earthX, earthY);
    this.transform(this.front, 1, 0);
    const moonImage = assetUrl('moon-surface-earth-view.png');
    this.setImage(this.moonSky, moonImage, 'moonSky');
    this.setImage(this.moonGround, moonImage, 'moonGround');
    this.root.style.background = '#000';
    this.moonSky.style.clipPath = 'inset(0 0 56% 0)';
    this.moonGround.style.clipPath = 'inset(43% 0 0 0)';
    this.moonGround.style.transformOrigin = 'center bottom';
    this.transform(this.moonSky, 1, skyOpacity);
    this.transform(this.moonGround, 1, groundProgress);
    this.moonGround.style.transform = `scaleY(${groundScale})`;
  }

  showLunarDeparture(targetEarthFrameIndex: number, progress: number) {
    const p = clamp01(progress);
    const handoff = .5;
    if (p <= handoff) {
      this.showLunarArrival(earthZoomFrames.length - 1, 1 - p / handoff);
      const moonArtworkOpacity = 1 - smoothstep(.12, .44, p);
      const retreat = p / handoff;
      const retreatScale = 1 - .42 * retreat;
      this.moonGround.style.transformOrigin = 'center';
      this.transform(this.moonSky, retreatScale, moonArtworkOpacity, -18 * retreat, -8 * retreat);
      this.transform(this.moonGround, retreatScale, moonArtworkOpacity, -18 * retreat, -8 * retreat);
      return;
    }
    this.showEarthTransition(earthZoomFrames.length - 1, targetEarthFrameIndex, (p - handoff) / (1 - handoff));
  }

  /** Pull back from the lunar surface into the scale-accurate 3D Earth–Moon scene. */
  showLunarDepartureToSystem(progress: number) {
    const p = clamp01(progress);
    const clear = smoothstep(.62, .9, p);
    const artworkOpacity = 1 - clear;
    const image = assetUrl('moon-surface-earth-view.png');
    this.setImage(this.moonSky, image, 'moonSky');
    this.setImage(this.moonGround, image, 'moonGround');
    this.root.style.background = '#000';
    this.moonSky.style.clipPath = 'inset(0 0 56% 0)';
    this.moonGround.style.clipPath = 'inset(43% 0 0 0)';
    this.moonGround.style.transformOrigin = 'center';
    this.transform(this.back, 1, 0);
    this.transform(this.front, 1, 0);
    // Earth begins at its lunar-art size and recedes steadily to its 800,000 km frame size.
    const retreatScale = 1 - .3 * p;
    this.transform(this.moonSky, retreatScale, artworkOpacity, -18 * p, -8 * p);
    this.transform(this.moonGround, retreatScale, artworkOpacity, -18 * p, -8 * p);
  }

  showSceneOnly() {
    this.setOpacity(1);
    this.transform(this.back, 1, 0);
    this.transform(this.front, 1, 0);
    this.transform(this.moonSky, 1, 0);
    this.transform(this.moonGround, 1, 0);
    this.root.style.background = 'transparent';
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
