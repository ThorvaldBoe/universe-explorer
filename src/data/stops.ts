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
const earthViewAngle = 35 * Math.PI / 180;
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
// Keep the final standing view aimed back toward Earth, above the lunar horizon.
const lunarLookAt: [number, number, number] = [0, 0, 0];

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
    cameraFovDegrees: altitudeKm < 1 ? 92 : altitudeKm < 10 ? 94 : altitudeKm < 200 ? 100 : 110,
    ...(altitudeKm === 0 ? { scenePositionKm: earthSurface, sceneUp: earthUp } : {}),
  };
}

export const stops: Stop[] = [
  {
    ...earthStop('street', '01 · Earth', 'On the street', 'A single painted lane marker fills the frame. The ascent starts straight up from the asphalt.', .0017, 1, 'Road surface · 1 m across'),
    cameraFovDegrees: 70,
  },
  earthStop('neighborhood', '01 · Earth', 'Above the avenue', 'The painted line recedes as nearby road detail and the first blocks enter the frame.', .35, 27, 'View width · 27 m'),
  earthStop('city', '01 · Earth', 'The city below', 'Roads, blocks, and the wider city appear through successive threefold zoom levels.', 8, 729, 'View width · 729 m'),
  earthStop('atmosphere', '02 · Earth and Moon', 'Above the atmosphere', 'The city gives way to regional detail, then the blue edge of the atmosphere.', 160, 19_683, 'View width · 19.7 km', 'planetary'),
  earthStop('continents', '02 · Earth and Moon', 'A continental view', 'Landforms expand across the view; the curved edge of Earth begins to emerge.', 2200, 531_441, 'View width · 531 km', 'planetary'),
  {
    ...earthStop('earth', '02 · Earth and Moon', 'Earth from orbit', 'A blue world hangs in deep black. The Moon is our next destination, about 384,400 km from Earth’s center.', 122_769, 129_140_163, 'Earth · 129,140 km view width', 'planetary'),
    cameraFovDegrees: 53.13,
  },
  {
    id: 'moon',
    chapter: '03 · Moon',
    title: 'A world of its own',
    introduction: 'Stand on the Moon’s near side. Earth hangs above the lunar horizon.',
    visibleWidthMeters: 100_000,
    scaleLabel: 'Moon surface · centers 384,400 km apart',
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
