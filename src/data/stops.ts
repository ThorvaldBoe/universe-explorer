import type { Stop } from '../types';
import {
  ASTRONOMICAL_UNIT_KM, EARTH_MOON_DISTANCE_KM, EARTH_RADIUS_KM, MOON_RADIUS_KM,
} from './solar-system';

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
const moonCenter: [number, number, number] = [EARTH_MOON_DISTANCE_KM, 0, 0];
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
const EARTH_MOON_MIDPOINT_KM: [number, number, number] = [EARTH_MOON_DISTANCE_KM / 2, 0, 0];

function solarStop(
  id: string, title: string, introduction: string,
  visibleWidthKm: number, scaleLabel: string,
  focus: [number, number, number], camera: [number, number, number],
): Stop {
  return {
    id, chapter: '04 · Solar System', title, introduction,
    visibleWidthMeters: visibleWidthKm * 1000,
    cameraFrameWidthMeters: visibleWidthKm * 1000,
    scaleLabel: `View width · ${scaleLabel}`,
    renderer: 'solar-system', provenance: id === 'oort-cloud' ? 'speculative' : 'illustrative',
    cameraPositionKm: camera, focusPositionKm: focus, lookAtPositionKm: focus,
    cameraUp: [0, 1, 0], cameraFovDegrees: 45,
  };
}

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
  solarStop(
    'earth-moon', 'Earth and Moon',
    'Earth and the Moon remain 384,400 km apart center to center. Both bodies keep their true size; the camera pulls away from the lunar surface while Earth recedes.',
    800_000, '800,000 km', EARTH_MOON_MIDPOINT_KM, EARTH_MOON_MIDPOINT_KM,
  ),
  solarStop(
    'inner-solar-system', 'The inner Solar System',
    'The Sun, Mercury, Venus, Earth and Mars fit within this view. Orbital distances are measured; phase positions and circular, coplanar paths are schematic. Planet markers are enlarged for legibility.',
    500_000_000, '500 million km', [-ASTRONOMICAL_UNIT_KM, 0, 0], [-ASTRONOMICAL_UNIT_KM, 0, 1],
  ),
  solarStop(
    'planetary-solar-system', 'The planetary Solar System',
    'Jupiter, Saturn, Uranus and Neptune emerge across vast distances. Neptune orbits about 30 AU from the Sun; planet markers are enlarged for legibility.',
    10_000_000_000, '10 billion km', [-ASTRONOMICAL_UNIT_KM, 0, 0], [-ASTRONOMICAL_UNIT_KM, 0, 1],
  ),
  solarStop(
    'beyond-neptune', 'Beyond Neptune',
    'Neptune, Pluto and the Kuiper Belt occupy the same broad neighborhood. Pluto’s changing orbit and the belt positions are shown schematically.',
    20_000_000_000, '20 billion km', [-ASTRONOMICAL_UNIT_KM, 0, 0], [-ASTRONOMICAL_UNIT_KM, 0, 1],
  ),
  solarStop(
    'oort-cloud', 'The Oort Cloud',
    'A diffuse, hypothetical reservoir of distant comets surrounds the planetary region. It has not been directly observed; the cloud is shown as a speculative illustration, not a measured shell.',
    28_382_100_000_000, '3 light-years', [-ASTRONOMICAL_UNIT_KM, 0, 0], [-ASTRONOMICAL_UNIT_KM, 0, 1],
  ),
];
