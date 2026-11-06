# Solar System storyboard

This document plans the next journey chapter after the Earth-to-Moon pilot. It defines the required scenes and the scale handoffs before any new artwork or rendering is produced.

## Visual and scale rules

- A displayed width is the width of the scene visible to the viewer. It is not camera altitude, orbital distance, or travel distance.
- Keep real planetary positions and sizes in the scene data. For subpixel planets, use clearly identified selectable markers rather than moving the planet itself.
- Treat generated planet surfaces and backgrounds as illustrative. Use measured orbital distances and radii as the geometry anchors.
- The existing Moon landing image is an illustrative near-side view. Its `100 km` scale chip does not describe the camera's physical height above the surface.
- Use each scene's own local origin and camera framing. Do not place Solar System coordinates in one giant, low-precision world coordinate space.

## The first transition: Moon to Earth–Moon scale

The Moon is the first geometry check. Keep the current lunar landing as the starting composition, with Earth ahead of the viewer. The initial outward transition must not make Earth suddenly grow because the camera is moving toward it. Use a continuous scale expansion/reframing, with the Earth and Moon placed from their actual relative geometry, rather than treating this as a straight camera flight from the lunar surface toward Earth.

The first chapter-scale frame is the already specified Earth–Moon view: approximately `800,000 km` wide. At this width, the mean `384,400 km` center-to-center separation occupies `48.1%` of the frame. Earth and Moon diameters are only about `1.59%` and `0.43%` of the frame, respectively, at true scale. Keep those ratios in the geometry; use separate labeled markers if the bodies need stronger visual emphasis.

For an orthographic storyboard layout centered on the Earth–Moon pair, place their centers `384,400 km` apart, with roughly `207,800 km` of margin on each side. Do not place the Moon a fixed number of Earth diameters away: the mean center separation is about `30.2` Earth diameters, while the Moon itself is much smaller than Earth. If the full scene uses perspective, derive framing from the camera and preserve the same physical positions instead of reusing the orthographic screen percentages.

This is a scale reveal, not a claim that a visitor can physically retreat from the Moon to the Earth while Earth gets smaller. The near-side lunar surface, Earth, and Moon do not form a straight outbound path that satisfies both “move away from the Moon” and “keep moving backward while facing Earth.” Preserve the established landing direction for the landing animation; for the new outward chapter, use scale-aware scene framing and make any camera path explicit.

## Solar System destination frames

| Order | Destination frame | Approximate visible width | Required visual content | Accuracy notes |
|---|---|---:|---|---|
| 0 | Earth–Moon pair (handoff) | 800,000 km | Earth and Moon together; lunar origin context | Existing itinerary target. Mean center separation 384,400 km; keep actual size ratio. |
| 1 | Inner Solar System | 500 million km | Sun, Mercury, Venus, Earth/Moon, and Mars with orbital paths | The width is about 3.34 AU. Show positions for one declared date or use a clearly schematic orbital layout; do not imply all planets are aligned. |
| 2 | Planetary Solar System | 10 billion km | Sun through Neptune, with the outer planets revealed against large empty distances | 10 billion km is about 66.8 AU; Neptune's mean orbital distance is about 30.1 AU. A marker may be needed at true apparent size. |
| 3 | Beyond Neptune | 20 billion km | Neptune, Pluto, and selected Kuiper Belt objects or belt region | Pluto's orbit is eccentric; label belt boundaries and dwarf-planet positions as schematic if not date-specific. |
| 4 | Oort Cloud | 3 light-years | Solar System within a vast, diffuse outer comet reservoir | The Oort Cloud is hypothetical and has not been directly imaged. Distinguish it from the measured heliosphere and heliopause. |

## Intermediate width checkpoints

Keep major destination frames from the original itinerary. Use intermediate widths only where they improve the cinematic zoom and ensure adjacent artwork overlaps in scale. The first expansion from `800,000 km` to `500 million km` is too large to present as one jump; a threefold sequence gives these candidate visible widths:

`0.8 million → 2.4 million → 7.2 million → 21.6 million → 64.8 million → 194.4 million → 500 million km`

These are framing checkpoints, not claims of travel distance. The middle frames can share one dynamically rendered Solar System scene rather than requiring a separate generated image at every width. At 500 million km, only the inner planets fit; later frames add the outer planets and then the hypothetical comet reservoir.

For subsequent scale changes, candidate checkpoints are:

- `500 million → 1.5 billion → 4.5 billion → 10 billion km`
- `10 → 20 billion km`
- `20 billion → 60 billion → 180 billion → 540 billion → 1.62 trillion → 4.86 trillion → 14.58 trillion → 28.38 trillion km` (about `3 light-years`).

## Implementation sequence

1. Add an Earth–Moon scale scene that is consistent with the current landing image and the `800,000 km` itinerary frame. Review the landing-to-scale handoff before adding other Solar System content.
2. Add one reusable, data-driven planetary renderer for the Sun and eight planets. Store radii, orbital elements or documented representative positions, units, dates, and source references separately from rendering.
3. Add visible-width camera presets for the four Solar System destination frames. Derive camera framing from the width and viewport aspect ratio; keep labels and object markers in a separate layer.
4. Represent orbital paths and scale-enhanced markers as presentation aids, visibly distinguishable from physical planet geometry.
5. Add the Oort Cloud as a speculative distribution with an explicit provenance label, not as a solid shell or observed boundary.
6. Review forward and reverse transitions on desktop, tablet, and phone. In particular, verify that Earth does not enlarge during the initial outward scale reveal and that no planet is silently moved to make a composition easier.

## Reference values

- Mean Earth–Moon center separation: `384,400 km`.
- Earth mean diameter: about `12,742 km`.
- Moon mean diameter: about `3,475 km`.
- 1 AU: about `149.6 million km`; Neptune's mean orbital distance: about `30.1 AU`.
- 1 light-year: about `9.461 trillion km`.

NASA references: [Earth facts](https://science.nasa.gov/earth/facts/), [Moon facts](https://science.nasa.gov/moon/facts/), and [Solar System facts](https://science.nasa.gov/solar-system/solar-system-facts/). Confirm numbers against current authoritative sources when adding them to app content.
