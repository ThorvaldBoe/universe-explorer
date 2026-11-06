# Stellar neighborhood storyboard

Step 3 continues the journey from the Oort Cloud into the Stars chapter. It implements stops 9–11 from the original itinerary and uses one local-coordinate renderer across all three frames.

## Scale and scene handoffs

| Stop | Visible width | Main reveal | Representation |
|---|---:|---|---|
| Nearest stars | 10 light-years | Sun, Proxima Centauri, and the Alpha Centauri system | Catalogued ICRS positions and parallax distances; fixed-size point markers identify stars whose physical disks are far below a pixel. |
| Stellar neighborhood | 100 light-years | A curated sample including Sirius, Procyon, Vega, Altair, Fomalhaut, Arcturus, Capella, and Pollux | Same catalogued 3D positions, centered on the Sun; the view remains intentionally sparse. |
| Local galactic region | 10,000 light-years | A reconstructed segment of the Orion Spur with stellar density and diffuse gas/dust forms | Procedural density and nebular artwork are explicitly reconstructed/illustrative, not a star catalogue or observed photograph. |

The view widths are diameters centered on the Sun. Thus the 10-light-year frame extends 5 light-years in each direction and contains the two nearest systems at approximately 4.25 and 4.40 light-years. Transition camera framing remains centered on the Sun and expands logarithmically from the 3-light-year Oort Cloud view. The Sun remains the local origin marker; Earth and individual Solar System planets are not implied to remain visually resolvable.

## Data and accuracy

- Named nearby stars use SIMBAD identifiers, ICRS J2000 coordinates, and catalogued parallax values. Distances are calculated as `distance (light-years) = 3.26156 × 1000 / parallax (milliarcseconds)`; the stored astrometry is an epoch snapshot, not a real-time ephemeris.
- Alpha Centauri A's coordinates stand in for the compact Alpha Centauri A/B system at these view widths. Proxima Centauri is a separate point at its own measured position.
- Star point sizes and labels are fixed-size presentation aids. They do not represent stellar diameters.
- The 10,000-light-year regional field is a deterministic reconstruction for orientation. Its particle density, Orion Spur shape, and gas/dust glow are illustrative. It is not a survey-derived catalogue or a map of a sharply bounded arm.

Source: [SIMBAD Astronomical Database](https://simbad.cds.unistra.fr/simbad/), individual records for the named stars in `src/data/stellar-neighborhood.ts` (coordinates and parallaxes retrieved 2026-11-06). The parallax references reported by SIMBAD include Gaia DR3 astrometry for faint nearby stars and Hipparcos-era astrometry for some bright stars. Recheck catalogues before making time-sensitive or higher-precision claims.

## Implementation plan

1. Store the light-year conversion, named-star identifiers, coordinates, parallaxes, and display metadata separately from the renderer.
2. Add one reusable stellar renderer in a Sun-centered light-year coordinate frame. Reuse the same group at 10, 100, and 10,000 light-years.
3. Keep the nearest-star and stellar-neighborhood views spatially anchored to catalogued coordinates; vary which labels appear with scale.
4. Add a separate, deterministic regional density layer for the Local Galactic Region and mark it reconstructed/illustrative.
5. Add the three stops after Oort Cloud, preserve camera framing on all viewport aspect ratios, and review the Oort-to-star transition plus every new stop on desktop, tablet, and phone.

## Acceptance checks

- Proxima Centauri and Alpha Centauri appear just inside the 10-light-year frame at their catalogued positions, without exaggerating their distance from the Sun.
- Named stars in the 100-light-year view use their stored 3D astrometry; labels and markers are presentation aids only.
- The 10,000-light-year view clearly changes provenance to reconstructed and does not present generated density as measured stellar positions.
- The Sun stays centered through the Oort Cloud → nearest stars → stellar neighborhood → Local Galactic Region zoom, with no giant world-coordinate model or renderer slide jump.
- All three new stops remain readable and WebGL-backed on desktop, tablet portrait, and phone.
