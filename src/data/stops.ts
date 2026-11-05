import type { Stop } from '../types';

const EARTH_RADIUS_KM = 6371;
const MOON_RADIUS_KM = 1737.4;
const MOON_DISTANCE_KM = 384_400;
const EARTH_LATITUDE = Math.PI / 4;
const MOON_SITE_LATITUDE = Math.PI / 4;
const earthUp = [0, Math.cos(EARTH_LATITUDE), Math.sin(EARTH_LATITUDE)] as [number, number, number];
const cityForward = [0, Math.sin(EARTH_LATITUDE), -Math.cos(EARTH_LATITUDE)] as [number, number, number];
const earthSurface: [number, number, number] = [
  0,
  EARTH_RADIUS_KM * earthUp[1],
  EARTH_RADIUS_KM * earthUp[2],
];
const streetPosition: [number, number, number] = [
  earthSurface[0] + earthUp[0] * .0017,
  earthSurface[1] + earthUp[1] * .0017,
  earthSurface[2] + earthUp[2] * .0017,
];
const streetViewDirection: [number, number, number] = [
  cityForward[0] - earthUp[0] * .003,
  cityForward[1] - earthUp[1] * .003,
  cityForward[2] - earthUp[2] * .003,
];
const streetLookAt: [number, number, number] = [
  streetPosition[0] + streetViewDirection[0] * .2,
  streetPosition[1] + streetViewDirection[1] * .2,
  streetPosition[2] + streetViewDirection[2] * .2,
];
const moonCenter: [number, number, number] = [MOON_DISTANCE_KM, 0, 0];
const moonUp: [number, number, number] = [
  -Math.cos(MOON_SITE_LATITUDE),
  0,
  Math.sin(MOON_SITE_LATITUDE),
];
const moonForward: [number, number, number] = [
  -Math.sin(MOON_SITE_LATITUDE),
  0,
  -Math.cos(MOON_SITE_LATITUDE),
];
const moonSurface: [number, number, number] = [
  moonCenter[0] + moonUp[0] * MOON_RADIUS_KM,
  moonCenter[1] + moonUp[1] * MOON_RADIUS_KM,
  moonCenter[2] + moonUp[2] * MOON_RADIUS_KM,
];
const lunarCameraPosition: [number, number, number] = [
  moonSurface[0] + moonUp[0] * .0017,
  moonSurface[1] + moonUp[1] * .0017,
  moonSurface[2] + moonUp[2] * .0017,
];
const lunarElevation = 20 * Math.PI / 180;
const lunarViewDirection: [number, number, number] = [
  moonUp[0] * Math.sin(lunarElevation) + moonForward[0] * Math.cos(lunarElevation),
  moonUp[1] * Math.sin(lunarElevation) + moonForward[1] * Math.cos(lunarElevation),
  moonUp[2] * Math.sin(lunarElevation) + moonForward[2] * Math.cos(lunarElevation),
];
const lunarLookAt: [number, number, number] = [
  lunarCameraPosition[0] + lunarViewDirection[0] * 1000,
  lunarCameraPosition[1] + lunarViewDirection[1] * 1000,
  lunarCameraPosition[2] + lunarViewDirection[2] * 1000,
];

export const stops: Stop[] = [
  {
    id: 'street',
    chapter: '01 · Earth',
    title: 'On the street',
    introduction: 'Stand on a city street. Look up, and begin the climb.',
    visibleWidthMeters: 120,
    scaleLabel: 'Street level · eye height 1.7 m',
    renderer: 'city',
    provenance: 'illustrative',
    cameraPositionKm: streetPosition,
    focusPositionKm: [0, 0, 0],
    lookAtPositionKm: streetLookAt,
    cameraUp: earthUp,
    cameraFovDegrees: 48,
    scenePositionKm: earthSurface,
    sceneUp: earthUp,
  },
  {
    id: 'earth',
    chapter: '02 · Earth and Moon',
    title: 'Earth from orbit',
    introduction: 'The city gives way to the curved Earth. The Moon is still nearly 384,400 km away.',
    visibleWidthMeters: 30_000_000,
    scaleLabel: 'Earth · 22,300 km from its center',
    renderer: 'planetary',
    provenance: 'observed',
    cameraPositionKm: [0, 15_768.26, 15_768.26],
    focusPositionKm: [0, 0, 0],
    lookAtPositionKm: [0, 0, 0],
    cameraUp: [1, 0, 0],
    cameraFovDegrees: 42,
  },
  {
    id: 'moon',
    chapter: '03 · Moon',
    title: 'A world of its own',
    introduction: 'Stand on the Moon’s near side. Earth hangs above the lunar horizon.',
    visibleWidthMeters: 100_000,
    scaleLabel: 'Lunar surface · near side',
    renderer: 'lunar',
    provenance: 'illustrative',
    cameraPositionKm: lunarCameraPosition,
    focusPositionKm: moonCenter,
    lookAtPositionKm: lunarLookAt,
    cameraUp: moonUp,
    cameraFovDegrees: 60,
    scenePositionKm: moonCenter,
    sceneUp: moonUp,
    sceneForward: moonForward,
  },
];
