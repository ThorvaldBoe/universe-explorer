# Cosmic Structures storyboard

This storyboard continues from the Local Group through nearby clusters and the flow-defined Laniakea region to an illustrative cosmic web, then finishes with the large-scale universe and the present-day observable horizon.

## Frames

| Stop | View width | Visual content | Evidence and limits |
| --- | ---: | --- | --- |
| Virgo and Nearby Groups | 100 million light-years | Local Group and enhanced anchors for Virgo, Fornax, and Centaurus. Cluster density clouds are soft point fields, not object boundaries. | Named cluster directions/distances are approximate, source-backed anchors. Marker sizes and surrounding density are illustrative. |
| Laniakea | 600 million light-years | The same anchors remain in view; subtle, open flow paths suggest the basin-scale connections and draw attention outward. | Laniakea is a region defined by galaxy peculiar-velocity flow, not a gravitationally bound object with a sharp edge. The flow paths are explanatory schematics, not measured streamlines. Tully et al. report an extent of roughly 160 Mpc (~520 million light-years); 600 million light-years is a rounded camera framing width, not a new boundary measurement. |
| The Cosmic Web | 2 billion light-years | The nearby structures recede into a low-contrast network of filament-like strands, nodes, and open voids. | The broad web is a deterministic illustrative reconstruction. It is not a complete survey, a statistically sampled simulation, or a map with individually measured galaxy positions. |

| Large-scale Universe | 10 billion light-years | A wider, sparse set of reconstructed filaments and nodes frames the local web against broad underdense regions. | The large field is a scale-aware visual reconstruction, not a complete galaxy survey or a measured all-sky map. |
| The Observable Universe | about 93 billion light-years across | A diffuse, observer-centered distribution with a soft, broken horizon ring and redshift-tinted points conveys the visible cosmic volume. | The diameter is a present-day distance convention; the universe is about 13.8 billion years old. The horizon is an observational limit, not a material surface or the edge of all space. Details and colors are illustrative. |

The frame widths are widths across the camera view, not diameters of bounded structures. Positions are represented in a Milky-Way-centered galactic display frame and measured in light-years within the scene. The renderer uses one shared, deterministic data hierarchy and changes level of detail by visible width. It projects positions from the active camera pose into a screen-space canvas overlay, avoiding billion-light-year GPU transforms while preserving angular positions and distance ratios.

## Transition intent

The Local Group remains at the origin used by the previous scene. The first cosmic frame shifts the camera target toward the midpoint between the Milky Way and Virgo, then expands the field of view across the named nearby clusters. The Laniakea and Cosmic Web stops retain that target so scale and structure change without an artificial camera pivot. The final two frames ease the target back to the Milky Way origin. The shared renderer extends the reconstructed web to a 10-billion-light-year field, then draws an observer-centered, soft observable-horizon envelope. For the 93-billion-light-year finale, the camera frame includes extra margin so the full horizon stays in view; the scale chip reports the approximate present-day diameter.

## Sources

- NASA HEASARC, [Virgo Cluster](https://heasarc.gsfc.nasa.gov/docs/rosat/gallery/clus_virgo.html): distance context.
- SIMBAD, [M87](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=M87): coordinate and distance reference for the Virgo anchor.
- NASA Science, [Fornax Cluster](https://science.nasa.gov/image-article/apod-2023-november-2-the-fornax-cluster-of-galaxies/).
- NASA Chandra, [Centaurus Cluster](https://chandra.si.edu/photo/2002/0146/).
- Tully et al. (2014), [The Laniakea supercluster of galaxies](https://doi.org/10.1038/nature13674), *Nature* 513, 71–73.
- NASA Science, [Large-scale structures](https://science.nasa.gov/universe/galaxies/large-scale-structures/).
- Tempel et al. (2014), [The cosmic web of the SDSS DR10 galaxies](https://doi.org/10.1093/mnras/stt2454), *MNRAS* 438, 3465–3482.
- NASA, [How Big Is Space?](https://www.nasa.gov/science-research/astrophysics/how-big-is-space-we-asked-a-nasa-expert-episode-61/) (observable universe estimated at about 92 billion light-years across; this storyboard uses ~93 billion as a rounded framing value).
- NASA Webb, [Big Bang Q&A](https://science.nasa.gov/mission/webb/big-bang-q-and-a/) (light from the early universe and the 13.8-billion-year age context).
- NASA, [What is the Universe?](https://science.nasa.gov/exoplanets/what-is-the-universe/) (age and expansion context).

The observable-universe visualization is centered on our observing position for presentation. Its broken, translucent horizon ring is a diagram of the present-day observable limit, not a surface or evidence of an edge to all space. Redshift tint and galaxy positions in the wide views are illustrative; the displayed web is not a catalog-complete survey.

## Implementation status

Implemented as the final two stops in the shared Cosmic Structures renderer. The 10-billion-light-year view grows the schematic large-scale web. The final frame shows an observer-centered volume and a softly marked horizon, labels the ~93-billion-light-year present-day diameter, and states separately that the universe is ~13.8 billion years old.
