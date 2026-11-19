type CesiumModule = typeof import('cesium');

export class CesiumCityView {
  private viewer?: import('cesium').Viewer;
  private Cesium?: CesiumModule;
  private visible = false;
  private destroyed = false;
  private lastWidth = 0;
  private lastOpacity = -1;

  constructor(private readonly host: HTMLElement) {}

  async initialize() {
    try {
      const Cesium: CesiumModule = await import('cesium');
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

      viewer.imageryLayers.addImageryProvider(new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/',
        maximumLevel: 19,
        credit: '© OpenStreetMap contributors',
      }));
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

  setWidth(widthMeters: number, duration = 0) {
    const viewer = this.viewer;
    if (!viewer || (this.lastWidth > 0 && Math.abs(Math.log(Math.max(1, widthMeters) / Math.max(1, this.lastWidth))) < 0.001)) return;
    this.lastWidth = widthMeters;
    const Cesium = this.Cesium;
    if (!Cesium) return;
    const fov = viewer.camera.frustum instanceof Cesium.PerspectiveFrustum
      ? viewer.camera.frustum.fovy ?? Cesium.Math.toRadians(60)
      : Cesium.Math.toRadians(60);
    const height = (widthMeters / 2) / Math.tan(fov / 2);
    const destination = Cesium.Cartesian3.fromDegrees(7.7188289, 63.1241405, height);
    const orientation = { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 };
    if (duration > 0) viewer.camera.flyTo({ destination, orientation, duration });
    else viewer.camera.setView({ destination, orientation });
  }

  destroy() {
    this.destroyed = true;
    this.viewer?.destroy();
    this.viewer = undefined;
  }
}
