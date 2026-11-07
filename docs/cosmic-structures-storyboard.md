# Cosmic Structures storyboard

This milestone continues from the Local Group and introduces three views of nearby clusters, the flow-defined Laniakea region, and an illustrative cosmic web. It deliberately stops before the 10-billion-light-year view and the observable-universe ending; those are a separate scale-and-science milestone.

## Frames

| Stop | View width | Visual content | Evidence and limits |
| --- | ---: | --- | --- |
| Virgo and Nearby Groups | 100 million light-years | Local Group and enhanced anchors for Virgo, Fornax, and Centaurus. Cluster density clouds are soft point fields, not object boundaries. | Named cluster directions/distances are approximate, source-backed anchors. Marker sizes and surrounding density are illustrative. |
| Laniakea | 600 million light-years | The same anchors remain in view; subtle, open flow paths suggest the basin-scale connections and draw attention outward. | Laniakea is a region defined by galaxy peculiar-velocity flow, not a gravitationally bound object with a sharp edge. The flow paths are explanatory schematics, not measured streamlines. Tully et al. report an extent of roughly 160 Mpc (~520 million light-years); 600 million light-years is a rounded camera framing width, not a new boundary measurement. |
| The Cosmic Web | 2 billion light-years | The nearby structures recede into a low-contrast network of filament-like strands, nodes, and open voids. | The broad web is a deterministic illustrative reconstruction. It is not a complete survey, a statistically sampled simulation, or a map with individually measured galaxy positions. |

The frame widths are widths across the camera view, not diameters of bounded structures. Positions are represented in a Milky-Way-centered galactic display frame and measured in light-years within the scene. The renderer uses one shared, deterministic data hierarchy and changes level of detail by visible width. It projects positions from the active camera pose into a screen-space canvas overlay, avoiding billion-light-year GPU transforms while preserving angular positions and distance ratios.

## Transition intent

The Local Group remains at the origin used by the previous scene. The first cosmic frame shifts the camera target toward the midpoint between the Milky Way and Virgo, then expands the field of view across the named nearby clusters. The Laniakea and Cosmic Web stops retain that target so scale and structure change without an artificial camera pivot. The cosmic renderer uses one shared group across all three stops; wide-scale web strands fade in gradually while named anchors and cluster hints recede.

## Sources

- NASA HEASARC, [Virgo Cluster](https://heasarc.gsfc.nasa.gov/docs/rosat/gallery/clus_virgo.html): distance context.
- SIMBAD, [M87](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=M87): coordinate and distance reference for the Virgo anchor.
- NASA Science, [Fornax Cluster](https://science.nasa.gov/image-article/apod-2023-november-2-the-fornax-cluster-of-galaxies/).
- NASA Chandra, [Centaurus Cluster](https://chandra.si.edu/photo/2002/0146/).
- Tully et al. (2014), [The Laniakea supercluster of galaxies](https://doi.org/10.1038/nature13674), *Nature* 513, 71–73.
- NASA Science, [Large-scale structures](https://science.nasa.gov/universe/galaxies/large-scale-structures/).
- Tempel et al. (2014), [The cosmic web of the SDSS DR10 galaxies](https://doi.org/10.1093/mnras/stt2454), *MNRAS* 438, 3465–3482.

## Next milestone

Continue from the cosmic web to a carefully framed ~10-billion-light-year large-scale view, then finish at the present-day observable universe, roughly 93 billion light-years in diameter. Keep the distinction between the observable universe's diameter and the age/lookback-time of the universe explicit. Choose authoritative data and a defensible visual representation before implementing those final stops.
