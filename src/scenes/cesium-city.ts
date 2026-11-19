type CesiumModule = typeof import('cesium');
import 'cesium/Build/Cesium/Widgets/widgets.css';

export class CesiumCityView {
  private viewer?: import('cesium').Viewer;
  private Cesium?: CesiumModule;
  private visible = false;
  private destroyed = false;
  private lastWidth = 0;
  private lastOpacity = -1;
  private enhancedAerial?: HTMLImageElement;
  private lastEnhancedScale = -1;
  private lastEnhancedOpacity = -1;

  constructor(private readonly host: HTMLElement) {}

  async initialize() {
    try {
      if (import.meta.env.PROD) await this.loadProductionCesium();
      const Cesium: CesiumModule = import.meta.env.PROD
        ? (window as unknown as { Cesium: CesiumModule }).Cesium
        : await import('cesium');
      if (this.destroyed) return;
      this.Cesium = Cesium;

      const viewer = new Cesium.Viewer(this.host, {
        animation: false,
        baseLayer: false,
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
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        sceneMode: Cesium.SceneMode.SCENE3D,
        scene3DOnly: true,
        requestRenderMode: true,
        maximumRenderTimeChange: Infinity,
        targetFrameRate: 20,
        msaaSamples: 1,
        useBrowserRecommendedResolution: true,
      });
      this.viewer = viewer;
      Cesium.Ion.defaultAccessToken = '';
      viewer.scene.globe.show = true;
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#16212c');
      viewer.scene.skyBox && (viewer.scene.skyBox.show = false);
      viewer.scene.sun && (viewer.scene.sun.show = false);
      viewer.scene.moon && (viewer.scene.moon.show = false);
      viewer.scene.screenSpaceCameraController.enableTilt = false;
      viewer.scene.screenSpaceCameraController.enableRotate = false;
      viewer.scene.screenSpaceCameraController.enableLook = false;
      viewer.scene.screenSpaceCameraController.enableTranslate = false;
      viewer.scene.screenSpaceCameraController.enableZoom = false;

      viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        // This area has aerial coverage through level 18; higher tile levels
        // return Esri's “Map data not available” placeholder, so Cesium must
        // upsample the last real image instead of replacing it with a gray tile.
        maximumLevel: 18,
        credit: 'Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community',
      }));
      const enhancedAerial = document.createElement('img');
      enhancedAerial.className = 'cesium-ai-aerial';
      enhancedAerial.alt = '';
      enhancedAerial.setAttribute('aria-hidden', 'true');
      enhancedAerial.draggable = false;
      enhancedAerial.src = `${import.meta.env.BASE_URL}imagery/ai-enhanced-street.webp`;
      this.enhancedAerial = enhancedAerial;
      this.host.append(enhancedAerial);
      viewer.scene.globe.tileLoadProgressEvent.addEventListener((remaining) => {
        if (remaining === 0 && this.host.dataset.mapStatus !== 'error') this.host.dataset.mapStatus = 'loaded';
      });
      this.setWidth(1);
      this.host.dataset.mapStatus = 'ready';
    } catch (error) {
      this.host.dataset.mapStatus = 'error';
      console.error('Cesium city map failed to initialize', error);
    }
  }

  private async loadProductionCesium() {
    const existing = document.querySelector<HTMLScriptElement>('script[data-cesium-runtime]');
    if (existing) {
      if (existing.dataset.loaded === 'true') return;
      await new Promise<void>((resolve, reject) => {
        existing.addEventListener('load', () => { existing.dataset.loaded = 'true'; resolve(); }, { once: true });
        existing.addEventListener('error', () => reject(new Error('Cesium runtime failed to load')), { once: true });
      });
      return;
    }
    const script = document.createElement('script');
    script.dataset.cesiumRuntime = 'true';
    script.src = new URL(`${import.meta.env.BASE_URL}universe-explorer/cesium/Cesium.js`, window.location.origin).href;
    await new Promise<void>((resolve, reject) => {
      script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
      script.addEventListener('error', () => reject(new Error('Cesium runtime failed to load')), { once: true });
      document.head.append(script);
    });
  }

  setVisible(visible: boolean) {
    if (this.visible === visible) return;
    this.visible = visible;
    this.host.classList.toggle('is-visible', visible);
    if (visible) this.viewer?.resize();
  }

  setOpacity(opacity: number) {
    const bounded = Math.max(0, Math.min(1, opacity));
    if (Math.abs(bounded - this.lastOpacity) > 0.01) {
      this.host.style.opacity = String(bounded);
      this.lastOpacity = bounded;
    }
    this.setVisible(bounded > 0.01);
  }

  setWidth(widthMeters: number) {
    const safeWidth = Math.max(1, widthMeters);
    const fadeProgress = Math.min(1, Math.max(0, Math.log(safeWidth / 27) / Math.log(3)));
    const easedFade = fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
    const enhancedOpacity = 1 - easedFade;
    const enhancedScale = Math.min(1, 27 / safeWidth);
    if (this.enhancedAerial) {
      if (Math.abs(enhancedOpacity - this.lastEnhancedOpacity) > 0.01) {
        this.enhancedAerial.style.opacity = String(enhancedOpacity);
        this.lastEnhancedOpacity = enhancedOpacity;
      }
      if (Math.abs(enhancedScale - this.lastEnhancedScale) > 0.001) {
        this.enhancedAerial.style.transform = `scale(${enhancedScale})`;
        this.lastEnhancedScale = enhancedScale;
      }
    }
    const viewer = this.viewer;
    if (!viewer || (this.lastWidth > 0 && Math.abs(Math.log(safeWidth / Math.max(1, this.lastWidth))) < 0.001)) return;
    this.lastWidth = safeWidth;
    const Cesium = this.Cesium;
    if (!Cesium) return;
    const fov = viewer.camera.frustum instanceof Cesium.PerspectiveFrustum
      ? viewer.camera.frustum.fovy ?? Cesium.Math.toRadians(60)
      : Cesium.Math.toRadians(60);
    const height = (safeWidth / 2) / Math.tan(fov / 2);
    const destination = Cesium.Cartesian3.fromDegrees(7.7188289, 63.1241405, height);
    const orientation = { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 };
    viewer.camera.setView({ destination, orientation });
    viewer.scene.requestRender();
  }

  destroy() {
    this.destroyed = true;
    this.viewer?.destroy();
    this.viewer = undefined;
  }
}
