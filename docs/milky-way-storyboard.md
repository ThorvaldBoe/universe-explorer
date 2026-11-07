# Milky Way storyboard

Step 4 continues from the reconstructed 10,000-light-year Local Galactic Region to the galaxy-scale Milky Way view. The implementation adds one selectable destination; the 30,000- and 90,000-light-year checkpoints are traversed during its continuous transition rather than added as separate stops.

## Scale and frames

| Frame | Visible width | Main reveal | Representation |
|---|---:|---|---|
| Local Galactic Region (existing handoff) | 10,000 light-years | The Sun and a small reconstructed segment of the Orion Spur | Existing illustrative density field; it is not a measured star-by-star map. |
| Galactic neighborhood (transition checkpoint) | 30,000 light-years | The Orion Spur in context; the Galactic Center is still outside the centered frame | Reconstructed star and gas density, with the Sun retained as the origin marker. |
| Inner Milky Way (transition checkpoint) | 90,000 light-years | The Galactic Center, central bar, bulge, and much of the disk emerge | Modeled structure informed by observations; not a direct external photograph. |
| Milky Way (destination) | About 150,000 light-years | The barred spiral disk, Sun in the Orion Spur, central bulge/bar, and diffuse outer context | Reconstructed external view. The width is a framing target, not a measured hard edge of the Galaxy. |

The 150,000-light-year value is the visible frame width specified in the original itinerary. It must not be presented as a precise galaxy diameter: common reference descriptions put the stellar disk at over 100,000 light-years across, and its boundary depends on how the disk is defined. Keep the frame-width readout distinct from any approximate disk-size annotation.

## Composition and camera handoff

- The 10,000-light-year scene begins Sun-centered. Keep the Sun's marker attached to the same conceptual origin as the preceding stars chapter.
- In the galactic coordinate model, place the Sun about 26,000 light-years from the Galactic Center, in the Orion Spur. NASA commonly rounds this to 26,000 light-years; ESA material gives about 26,600 light-years. Use a rounded value and record which source a production data revision follows.
- At 30,000 light-years of visible width, retain the Sun-centered framing; the Galactic Center lies beyond the half-width, so do not show it as if already inside the frame.
- As the view grows toward 90,000 light-years, smoothly shift the camera target toward the Galactic Center. The local stellar field and galactic model share a face-on disk-plane orientation, so keep that orientation continuous rather than adding an abrupt turn. Keep the Sun and a “You are here” marker visible at its actual offset from the center.
- Finish near 150,000 light-years with the galactic center legible and most of the stellar disk inside frame. If an adjustment is needed to fit the full disk, change framing while preserving the stated visible width and physical Sun-to-center offset.
- Treat the face-on exterior composition as a visualization reframe, not a literal claim that the traveler followed a simple straight path to an external position. Avoid a sudden crossfade or a galaxy image that appears disconnected from the local star field.

## Visual direction

Reveal the Galaxy as a layered structure rather than an icon appearing all at once: local stars blend into the Orion Spur; other arm segments and the broad disk emerge; the central bar and bulge resolve as the camera reframes; dust lanes and a diffuse halo add depth. Use a restrained star-density field so the spiral form reads clearly at the destination scale.

The Milky Way cannot be photographed from outside. Show the external view as **Reconstructed** or **Modeled** in the scene provenance. Spiral-arm shape, bar orientation, disk edge, and relative brightness are informed by observations but remain a model. Do not label procedural star particles as individually measured catalogue stars. The galactic-center marker, if shown, is an enhanced presentation aid; it does not depict the black hole's physical size.

## Accuracy and data boundaries

- Store galactic structure and the Sun's position in an explicit local galactic coordinate frame. Keep units visible in data names and convert to camera coordinates at the scene boundary.
- Keep rendering camera-relative or floating-origin so the renderer does not multiply light-year coordinates into one enormous GPU coordinate space.
- The existing nearby-star catalogue remains an observed/catalogued layer. The wider spiral and density field are a separate reconstructed layer with distinct provenance.
- Treat arm boundaries as broad, uncertain structures. Dust obscures parts of the Milky Way from our interior vantage point, and the Galaxy has no single sharply defined outer edge.
- Keep scale comparisons appropriately qualified. For example, the Sun is roughly halfway from the Galactic Center to the outer stellar disk; do not imply the entire Galaxy is a flat, perfectly symmetric pinwheel.

## Implementation sequence

1. Add galactic coordinates and scale data separately from the renderer, with source and uncertainty notes for the Sun's galactocentric distance and the approximate disk size.
2. Build a reusable galactic renderer with a Sun marker, Orion Spur, central bar/bulge, spiral-arm density, and diffuse halo.
3. Reveal scale-aware layers from the 10,000-light-year local scene through 30,000, 90,000, and 150,000 light-years, blending the Milky Way into the existing star field.
4. Ease the camera target toward the face-on reconstructed view while keeping the disk-plane orientation continuous and the Sun marker at the correct galactic offset.
5. Add one selectable Milky Way destination after the Local Galactic Region, retaining the planned itinerary order and 150,000-light-year visible-width target.
6. Capture and inspect forward and reverse transitions plus every new frame on desktop, iPad portrait, and phone.

## Acceptance checks

- The destination frame reports approximately 150,000 light-years of visible width and does not call that value the Galaxy's precise diameter.
- The Sun remains visible in the Orion Spur at about 26,000 light-years from the Galactic Center; the camera reframe does not move the Sun in the model.
- The Galactic Center is not shown inside the 30,000-light-year Sun-centered frame; it appears as the view expands toward 90,000 light-years.
- The face-on view emerges through continuous scale and camera motion, with no unrelated-slide handoff.
- The external Milky Way view is labeled reconstructed/modeled, and particle density is not presented as a complete observed catalogue.
- The renderer uses local/camera-relative coordinates and remains legible on desktop, tablet portrait, and phone.

## References

- Original journey target and scientific framing: [initial-spec.md](../initial-spec.md), Stops 12 and Sections 4–5.
- NASA, [Galaxies](https://science.nasa.gov/universe/galaxies/) — the Milky Way's stellar disk spans more than 100,000 light-years; the Solar System is about halfway from the center.
- NASA GSFC, [Imagine the Universe: The Milky Way](https://imagine.gsfc.nasa.gov/science/featured_science/milkyway/index.html) — approximate 100,000-light-year diameter and 26,000-light-year Solar System distance.
- ESA, [Guide to our galaxy](https://www.esa.int/content/view/full/423444) — barred-spiral structure and approximate Sun-to-center distance.
- ESA, [Top-down view of the Milky Way](https://www.esa.int/ESA_Multimedia/Images/2023/12/Top-down_view_of_the_Milky_Way) — explicitly identifies the external view as an illustration/reconstruction because the Galaxy cannot be photographed from outside.

Recheck source values and image/data attribution when production data is revised. Published descriptions may use different conventions for the stellar disk's diameter and the Solar System's distance from the Galactic Center.
