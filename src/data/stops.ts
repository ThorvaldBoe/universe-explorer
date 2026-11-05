import type { Stop } from '../types';

const EARTH_RADIUS_KM = 6371;
const MOON_RADIUS_KM = 1737.4;
const MOON_DISTANCE_KM = 384_400;
const EARTH_LATITUDE = Math.PI / 4;
const MOON_SITE_LATITUDE = Math.PI / 4;
const earthUp = [0, Math.cos(EARTH_LATITUDE), Math.sin(EARTH_LATITUDE)] as [number, number, number];
const cityForward = [0, Math.sin(EARTH_LATITUDE), -Math.cos(EARTH_LATITUDE)] as [number, number, number];
// Keep one view direction for every Earth ascent stop: almost straight down, with enough
// forward angle to keep the avenue visible beneath the camera.
const earthViewAngle = 12 * Math.PI / 180;
const earthViewDirection = [
  cityForward[0] * Math.sin(earthViewAngle) - earthUp[0] * Math.cos(earthViewAngle),
  cityForward[1] * Math.sin(earthViewAngle) - earthUp[1] * Math.cos(earthViewAngle),
  cityForward[2] * Math.sin(earthViewAngle) - earthUp[2] * Math.cos(earthViewAngle),
] as [number, number, number];
const earthScreenUp = [
  cityForward[0] * Math.cos(earthViewAngle) + earthUp[0] * Math.sin(earthViewAngle),
  cityForward[1] * Math.cos(earthViewAngle) + earthUp[1] * Math.sin(earthViewAngle),
  cityForward[2] * Math.cos(earthViewAngle) + earthUp[2] * Math.sin(earthViewAngle),
] as [number, number, number];
const earthSurface: [number, number, number] = [0, EARTH_RADIUS_KM * earthUp[1], EARTH_RADIUS_KM * earthUp[2]];
const earthCamera = (altitudeKm: number): [number, number, number] => [
  earthUp[0] * (EARTH_RADIUS_KM + altitudeKm),
  earthUp[1] * (EARTH_RADIUS_KM + altitudeKm),
  earthUp[2] * (EARTH_RADIUS_KM + altitudeKm),
];
const earthLookAt = (position: [number, number, number]): [number, number, number] => [
  position[0] + earthViewDirection[0],
  position[1] + earthViewDirection[1],
  position[2] + earthViewDirection[2],
];
const moonCenter: [number, number, number] = [MOON_DISTANCE_KM, 0, 0];
const moonUp: [number, number, number] = [-Math.cos(MOON_SITE_LATITUDE), 0, Math.sin(MOON_SITE_LATITUDE)];
const moonForward: [number, number, number] = [-Math.sin(MOON_SITE_LATITUDE), 0, -Math.cos(MOON_SITE_LATITUDE)];
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

function earthStop(
  id: string, chapter: string, title: string, introduction: string,
  altitudeKm: number, visibleWidthMeters: number, scaleLabel: string,
  renderer: Stop['renderer'] = 'city',
): Stop {
  const cameraPositionKm = earthCamera(altitudeKm);
  return {
    id, chapter, title, introduction, visibleWidthMeters, scaleLabel, renderer,
    provenance: renderer === 'planetary' ? 'observed' : 'illustrative',
    cameraPositionKm,
    focusPositionKm: [0, 0, 0],
    lookAtPositionKm: earthLookAt(cameraPositionKm),
    cameraUp: earthScreenUp,
    cameraFovDegrees: 58,
    ...(altitudeKm === 0 ? { scenePositionKm: earthSurface, sceneUp: earthUp } : {}),
  };
}

export const stops: Stop[] = [
  {
    ...earthStop('street', '01 · Earth', 'On the street', 'Look down the avenue. Then rise straight back, keeping your gaze fixed on the road below.', .0017, 120, 'Street level · eye height 1.7 m'),
    cameraFovDegrees: 70,
  },
  earthStop('neighborhood', '01 · Earth', 'Above the avenue', 'Street blocks begin to resolve into a neighborhood as the camera lifts above the rooftops.', .35, 1200, 'Neighborhood · 350 m above the surface'),
  earthStop('city', '01 · Earth', 'The city below', 'The city grid and the surrounding landscape come into view, while the road remains beneath you.', 8, 30_000, 'City scale · 8 km above the surface'),
  earthStop('atmosphere', '02 · Earth and Moon', 'Above the atmosphere', 'The blue edge of the atmosphere appears. The continent is still close enough to read.', 160, 800_000, 'Upper atmosphere · 160 km above the surface', 'planetary'),
  earthStop('continents', '02 · Earth and Moon', 'A continental view', 'A curved horizon opens around the continent. Earth’s true scale begins to emerge.', 2200, 15_000_000, 'Low orbit · 2,200 km above the surface', 'planetary'),
  earthStop('earth', '02 · Earth and Moon', 'Earth from orbit', 'The whole planet now fits in view. The Moon is still nearly 384,400 km away.', 22_300 - EARTH_RADIUS_KM, 30_000_000, 'Earth · 22,300 km from its center', 'planetary'),
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
