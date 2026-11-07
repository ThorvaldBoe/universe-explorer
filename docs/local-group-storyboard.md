# Local Group storyboard

Step 5 continues from the reconstructed Milky Way to the Local Group, our nearby association of several dozen galaxies. The implementation adds one selectable stop at a 10-million-light-year view width; the 1- and 3-million-light-year marks are transition checkpoints, not separate journey stops.

## Scale and reveal

| Frame | Approximate visible width | Main reveal | Representation |
|---|---:|---|---|
| Milky Way (existing handoff) | 150,000 light-years | The Sun remains anchored in the Milky Way's disk | Reconstructed barred-spiral model. |
| Nearby galaxies (transition checkpoint) | About 1 million light-years | The Milky Way's position in its wider neighborhood | Galaxy markers begin to resolve; not a boundary. |
| The two large spirals (transition checkpoint) | About 3 million light-years | Milky Way and Andromeda, with Triangulum nearby | Approximate positions from observed directions and rounded distances. |
| The Local Group (destination) | 10 million light-years | Milky Way, Andromeda, Triangulum, and a schematic field of dwarf members | Reconstructed spatial view with enhanced galaxy markers. |

The 10-million-light-year width is an itinerary framing target, not a sharp edge or measured diameter of the Local Group. The group contains dozens of galaxies; membership and its boundary depend on the adopted definition.

## Composition and coordinate continuity

- Keep the Galactic Center as the local coordinate origin used by the Milky Way scene. Preserve the Sun at the same 26,000-light-year offset within the Milky Way.
- Place Andromeda about 2.5 million light-years from the Sun, and show Triangulum at an approximate 2.7-million-light-year distance. These are rounded presentation anchors, not a new orbital solution.
- Transform the galaxies' J2000 sky directions into the same Galactic display axes used by the previous scene. The target view is framed halfway between the Milky Way and Andromeda for composition; that point is not presented as a measured Local Group barycenter.
- Ease the camera target from the Galactic Center toward the Local Group frame while expanding the logarithmic view width. Blend the Milky Way renderer out as the neighboring galaxies resolve.
- Do not draw a solid group boundary. The diffuse dwarf-galaxy markers communicate that many smaller members exist; their displayed distribution is schematic, not a complete catalogue.

## Scientific and visual limits

The positions of the Milky Way, Andromeda, and Triangulum are based on observed directions and approximate distances. Their galaxy disks are procedural visual models, and their display orientations and enhanced point markers are presentation aids. The faint dwarf-galaxy field is illustrative. Label the scene **Observed galaxy anchors · reconstructed group view** and explain that the 10-million-light-year value is visible width.

## Acceptance checks

- The destination reports a 10-million-light-year view width without calling it the Local Group's precise diameter.
- Andromeda appears about 2.5 million light-years from the Sun; Triangulum is shown in the same approximate neighborhood.
- The Sun stays attached to the Milky Way as the framing expands; there is no unrelated-slide cut between chapters.
- Galaxy disks and markers are visually legible but are not presented as literal images at true apparent brightness.
- The desktop, portrait-tablet, and phone views remain readable, with no label collisions or text covering the group composition.

## References

- Original framing and journey context: [initial-spec.md](../initial-spec.md), Stop 13.
- NASA, [Andromeda Galaxy](https://www.nasa.gov/universe/galaxies/andromeda-galaxy/) — Andromeda is about 2.5 million light-years away and the most massive Local Group member.
- NASA Hubble, [The fate of the Milky Way, Andromeda, and Triangulum](https://science.nasa.gov/asset/hubble/the-fate-of-the-milky-way-andromeda-and-triangulum-galaxies/) — identifies the three largest galaxies in the group.
- ESA Gaia, [New speeds for the Milky Way–Andromeda collision](https://www.esa.int/Science_Exploration/Space_Science/Gaia/Gaia_clocks_new_speeds_for_Milky_Way-Andromeda_collision) — describes the Local Group and the approximate 2.5–3-million-light-year separations of its major spirals.
- SIMBAD, [Astronomical Database](https://simbad.cds.unistra.fr/simbad/) — J2000 sky coordinates used to orient the named galaxy markers.
