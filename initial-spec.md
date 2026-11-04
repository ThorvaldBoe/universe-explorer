Universe Explorer — Product and Technical Specification

Status: Initial implementation specification
Purpose: Hand-off to Codex for planning and incremental implementation
Target: Browser-based, publicly accessible interactive astronomy experience

1. Vision

Create an immersive, scientifically grounded journey from the surface of Earth to the edge of the observable universe. The visitor presses Go Further repeatedly. Each stop reveals that the previous, seemingly enormous scale is tiny compared with what comes next. The central emotional sequence is recognition → wonder → surprise → discovery. The user chooses when to advance, rather than watching a passive video.

The experience should be beautiful even if the visitor never reads an information box, but should reward curiosity with selectable objects, concise facts, scale comparisons, and references. End with the realization that the observable universe is not necessarily the entire universe, and offer a cinematic Return to Earth sequence ending with “Welcome home.”

Product principles

1. Wow before lecture. Let the visual reveal land before introducing explanatory copy.
2. User-controlled pacing. Never auto-advance between major stops.
3. Continuous spatial narrative. Animate outward from Earth and retain an origin marker (“You are here”) at larger scales.
4. Accuracy with transparency. Clearly identify true-scale measurements, enhanced visibility, reconstructions, and speculative imagery.
5. Progressive detail. Concise stop introduction; optional object information and comparisons.
6. Fast, accessible, responsive. Desktop and mobile, keyboard and touch support, reduced-motion alternative.
7. No mandatory backend. Ship as a static site; avoid external runtime dependencies where feasible.

2. User experience

2.1 Journey mode (default)

• Begin at Earth’s surface, looking toward the horizon; user clicks Go Further.
• Animate a zoom-out through a sequence of defined scale stops. Use cinematic easing and smooth crossfades between levels of detail.
• At each stop: show title, short introduction, visible-region scale, and one memorable comparison. Keep the scene mostly unobstructed.
• Controls: Previous, Go Further, Explore, optional stop selector/progress, Return to Earth (when unlocked), pause/replay animation.
• On arrival, allow a short visual beat before surfacing controls/text.
• Preserve a conceptual Earth-origin anchor: label Earth, then Solar System, then Sun’s location in Milky Way, then Milky Way/Local Group. Do not imply Earth remains physically visible at extreme scales.
• A persistent compact scale readout can show visible width and a human-readable unit (km, AU, ly, Mly, Gly).

2.2 Explore mode

• Pause progression at the current stop; allow appropriate orbit/pan/zoom within bounded limits.
• Click/tap visible bodies or markers to open a contextual object panel; allow closing it without losing camera state.
• Labels must remain selectable for significant objects too small to render visibly at their actual apparent size.
• Provide a Back to Journey action restoring the stop’s intended framing.
• Avoid accidental camera movement when users tap information controls.

2.3 Three levels of information

A. Stop introduction: 2–3 sentences establishing what is now visible, why it matters, and an intriguing fact.
B. Object panel: name, category, visual, short description, verified quantitative properties, interesting facts, and optional source links.
C. Scale comparison: a concrete relatable analogy, with units and assumptions stated where necessary.

The same object may have different contextual descriptions at different scales. For example, Earth at Earth–Moon scale focuses on diameter and atmosphere; the Sun marker in the Milky Way focuses on galactic position and orbital period.

2.4 Ending

At the last stop, show Go Further? again. Instead of inventing an external view, explain: “This is the edge of what we can observe—not necessarily the edge of the universe.” The full universe’s extent and global geometry are unknown. If speculative visualizations are offered, require an explicit Speculative Mode label and separate them from observed/reconstructed astronomy. Provide Return to Earth as an emotionally satisfying reverse journey.

3. Journey stops

All visible widths are illustrative targets, not exact camera positions. Tune framing to the aspect ratio and actual astronomical geometry. Distinguish altitude, diameter, orbital distance, and visible width in UI and data.

|# |Chapter          |Stop                  |Approximate framing / scale           |Main reveal and selectable features                                                                  |
|--|-----------------|----------------------|--------------------------------------|-----------------------------------------------------------------------------------------------------|
|1 |Earth            |Earth’s surface       |A few km                              |Horizon, atmosphere, clouds; start on the ground.                                                    |
|2 |Earth            |Low Earth orbit       |~400 km altitude                      |Curved horizon, thin atmosphere; ISS altitude as context.                                            |
|3 |Earth            |Whole Earth           |~30,000 km visible width              |Full blue planet; continents, clouds, atmosphere.                                                    |
|4 |Earth            |Earth and Moon        |~800,000 km visible width             |Earth–Moon separation (~384,400 km average), Moon ~30 Earth diameters away.                          |
|5 |Solar System     |Inner solar system    |~500 million km visible width         |Sun, Mercury, Venus, Earth, Mars and their orbital paths; huge empty distances.                      |
|6 |Solar System     |Planetary solar system|~10 billion km visible width          |Jupiter, Saturn, Uranus, Neptune; Neptune ~30 AU from Sun.                                           |
|7 |Solar System     |Beyond Neptune        |~20 billion km visible width          |Pluto, Kuiper Belt, selected dwarf planets.                                                          |
|8 |Solar System     |Oort Cloud            |~3 ly visible width                   |Hypothesized distant comet reservoir; distinguish from heliopause and planetary region.              |
|9 |Stars            |Nearest stars         |~10 ly visible width                  |Sun, Proxima Centauri (~4.24 ly), Alpha Centauri system.                                             |
|10|Stars            |Stellar neighborhood  |~100 ly visible width                 |Sirius, Vega, Procyon, other catalogued stars; accurate positions where available.                   |
|11|Stars            |Local galactic region |~10,000 ly visible width              |Stellar clouds, nebulae, local arm; individual stars blend into density.                             |
|12|Galaxy           |Milky Way             |~150,000 ly visible width             |Barred spiral reconstruction; Sun ~26,000 ly from galactic center; ~100–400 billion stars (estimate).|
|13|Galaxy           |Local Group           |~10 million ly visible width          |Milky Way, Andromeda (~2.5 Mly away), Triangulum, dwarf galaxies.                                    |
|14|Cosmic structures|Nearby groups/clusters|~100 million ly visible width         |Virgo Cluster, surrounding groups, galaxy concentrations.                                            |
|15|Cosmic structures|Laniakea              |~600 million ly visible width         |Flow-defined supercluster-scale region; **not** a single gravitationally bound structure.            |
|16|Cosmic structures|Cosmic web            |~2 billion ly visible width           |Galaxy filaments, sheets, nodes and voids.                                                           |
|17|Cosmos           |Very large scales     |~10 billion ly visible width          |Cosmic web continues; statistical homogeneity at sufficiently large scales.                          |
|18|Cosmos           |Observable universe   |~92–93 billion ly present-day diameter|Cosmological horizon; ~46 billion ly present-day radius; age ~13.8 billion years; expansion matters. |

Stop content examples

• Earth–Moon: At true scale, both bodies are small compared with their separation. All eight planets’ diameters added together are approximately less than the average Earth–Moon distance (depending on exact figures); verify numbers before publishing.
• Neptune: Sunlight takes roughly 4 h 10 min to reach Neptune (varies with orbital position).
• Proxima Centauri: A journey of ~4.24 ly at 100 km/h would take on the order of 46 million years, neglecting acceleration and relativistic effects.
• Milky Way: Light takes roughly 100,000 years to cross its stellar disk; its exact diameter is definition-dependent.
• Observable universe: Its current radius is much greater than 13.8 billion ly because space expanded while light traveled.

4. Scientific and visual integrity

4.1 Two display styles

• Scientific / true-scale mode (default): Preserve geometric distances and physical object sizes where represented; use clearly differentiated labels, halos, and markers for subpixel objects. A scientifically accurate view may be mostly empty.
• Cinematic / enhanced mode: Permit enlarged objects, boosted brightness, exaggerated density, and artistic transitions, but visibly label enhancements and never present them as true scale.

Do not conflate “physically to scale” with “every object visible.” For distant objects, display glyphs/markers independently from rendered geometry.

4.2 Source classification

Attach a provenance label to content/visuals:

• Observed / measured — based on real catalogues or observations.
• Reconstructed / modeled — e.g. external view of the Milky Way or cosmological structure inferred from surveys.
• Illustrative — artistically generated or procedurally populated for legibility.
• Speculative — hypothetical beyond-observable scenarios.

The Milky Way cannot be photographed from outside. No complete 3D map exists of the observable universe. The Oort Cloud remains hypothetical and has not been directly imaged as a cloud. Cosmic-web imagery may come from survey reconstructions or simulations, which should be identified.

4.3 Data and asset sources to investigate

• NASA planetary imagery, reference facts, and public media (check individual asset rights and attribution).
• ESA Gaia for a curated subset of nearby stellar positions/distances.
• NASA/IPAC Extragalactic Database for selected galaxy properties.
• Sloan Digital Sky Survey for galaxy distributions and large-scale structure.
• Planck collaboration for cosmic microwave background imagery/data.
• Published cosmological simulations for illustrative cosmic-web structure, subject to license and attribution.

Preprocess datasets offline into compact app-ready JSON/binary. Do not attempt to load massive raw astronomical catalogs into the browser. Document every source and asset license.

5. Architecture

5.1 Recommended stack

• TypeScript + Vite.
• Three.js / WebGL for 3D, point clouds, shaders, textures and animation.
• HTML/CSS UI (or React if state complexity warrants it).
• Static JSON or typed TS content for stops and object metadata.
• Static hosting on GitHub Pages initially; optional CDN for large assets later.
• No required backend, database, paid API, or authentication for MVP.

5.2 Modules

1. UniverseController: active stop, navigation, transition state, progress, user input.
2. ScaleCamera: logarithmic visible-width model, smooth interpolation, per-scene framing, floating-origin / relative coordinates.
3. SceneManager: lazy loading, activation, cleanup, crossfade, memory budget.
4. Renderers: planetary; nearby stars; galactic; extragalactic/cosmological.
5. ObjectRegistry: IDs, scene membership, positions/markers, selection hit targets, provenance.
6. ContentStore: stop introductions, facts, comparisons, references, localized text later.
7. UIOverlay: navigation, scale indicator, scene card, object information, accessibility.
8. QualityManager: device capability detection, resolution/particle/texture settings, performance adaptation.

5.3 Example conceptual data shapes

type Provenance = 'observed' | 'reconstructed' | 'illustrative' | 'speculative';

type Stop = {
  id: string;
  order: number;
  chapter: string;
  title: string;
  targetVisibleWidthMeters: number; // approximate conceptual width, not raw world-space coordinate
  introduction: string;
  revelation: string;
  renderer: 'planetary' | 'stellar' | 'galactic' | 'cosmological';
  objectIds: string[];
  cameraPreset: string;
};

type AstronomicalObject = {
  id: string;
  name: string;
  category: string;
  provenance: Provenance;
  properties: Record<string, { value: number | string; unit?: string }>;
  description: string;
  interestingFacts: string[];
  references: { title: string; url: string }[];
};

Use a separate, explicit coordinate model per scale. Astronomical numbers spanning kilometers to billions of light-years should not be naively represented as a single enormous Three.js coordinate space. Note that JavaScript numbers can represent wide magnitudes, but GPU floating-point precision, near/far clipping, and depth buffering make naive rendering unsuitable.

5.4 Transitions

• Treat scale as log10(visibleWidthMeters) or equivalent.
• Animate logarithmic scale rather than linearly interpolating raw distance.
• Use eased animation with optional accelerated middle and slower arrival.
• During transitions, blend adjacent levels of detail and renderers.
• Replace detailed spheres with point markers at appropriate apparent sizes; replace dense stars with distribution models; replace galaxies with luminous glyphs/density maps.
• Preserve a meaningful Earth-origin anchor while allowing cinematic framing shifts.
• Avoid misleading zoom discontinuities: if a scene is conceptual rather than spatially contiguous, communicate that clearly.
• Provide reduced-motion mode (short dissolve/jump with persistent labels) and skip/replay controls.

5.5 Performance

• Lazy load only required/current and next-scene assets; dispose of unused GPU resources.
• Instancing, batched point clouds, LOD, compressed textures, limited draw calls.
• Adaptive pixel ratio and particle counts for mobile.
• Avoid computationally expensive physics: this is a guided visualization, not a full gravitational simulation.
• Aim for ~60 fps on capable desktop and ~30–60 fps on supported mobile, subject to profiling; these are goals, not guarantees.
• Keep first meaningful interaction quick; measure transfer size, GPU memory, frame times and transition stutter.

6. UI and accessibility

• Dark space canvas occupying most of the viewport; minimal, unobtrusive overlays.
• Primary Go Further button visually dominant; Previous, Explore, and optional stop menu secondary.
• Info panels must work with pointer, touch, keyboard, and screen readers.
• Labels should avoid overlaps; prioritization and clustering at dense scales.
• Touch targets at least comfortable mobile size; support narrow viewports and safe areas.
• Keyboard: Enter/Space activate controls, Escape closes panels, optional arrow keys for stops.
• Respect prefers-reduced-motion; maintain readable contrast and focus states.
• Provide a text-only summary or accessible alternate view for major astronomical revelations.
• All object info must remain readable even if 3D graphics are unavailable.

7. Development plan

Phase 0 — Project skeleton and design system

• Set up TypeScript/Vite/Three.js, tests, linting, formatting, CI and GitHub Pages deploy.
• Define stop and object schemas, UI shell, design tokens, and asset/source conventions.
• Implement a static fallback and basic navigation.

Phase 1 — Technical vertical slice (highest priority)

Implement four scales: Earth → Solar System → Milky Way → Cosmic Web.

• Earth textured sphere with atmosphere and a recognizable visual.
• Solar System with real relative distances and visible markers for planets.
• Milky Way procedural/reconstructed galaxy with Sun position marker.
• Cosmic Web procedurally rendered or sourced from a documented simulation.
• Smooth logarithmic zoom, LOD/crossfade transitions, back/forward navigation.
• Desktop/mobile prototype with frame-time instrumentation.

Gate: The four stops must feel like one coherent journey. If transitions look like unrelated slide changes, refine the transition engine before adding content.

Phase 2 — Complete guided journey

• Add all 18 stops, grouped into six chapters.
• Create curated stop introductions and scale comparisons.
• Implement origin marker, scale readout, progress navigation, pause/skip/replay.
• Create observable-universe ending and reverse Return to Earth sequence.

Phase 3 — Explore and discovery

• Selectable astronomical objects, hit areas, hover/tap labels.
• Context-sensitive information panels with properties, memorable facts, and references.
• Bounded camera exploration, restore Journey framing.
• Scientific/cinematic mode switch and source/provenance badges.

Phase 4 — Scientific review and polish

• Verify numerical claims and definitions against authoritative references.
• Check licenses, attribution and origin of every dataset/texture.
• Optimize mobile loading, frame rate, touch, responsiveness and accessibility.
• Test full journey in major browsers, including mobile Safari.
• Add automated smoke tests and visual regression snapshots where practical.

Phase 5 — Optional enhancements

• More stops and astronomical objects.
• Searchable stop/object atlas and deep links.
• Multilingual content.
• Shareable screenshots or scene URLs.
• Optional explicitly labeled speculative beyond-observable experience.
• More detailed datasets, procedural shaders, audio (optional and user-controlled).

8. Acceptance criteria

Functional

☐ User can traverse all implemented stops forwards and backwards without reloading.
☐ Each stop has correct title, unit-aware scale and introductory fact.
☐ Camera transitions are smooth, cancelable/skippable, and do not strand the UI.
☐ Origin marker remains meaningful and does not imply subpixel objects are literally visible.
☐ Explore mode opens and closes information for selectable objects.
☐ Returning to Journey restores intentional camera framing.
☐ Final scene correctly distinguishes observable universe from the unknown whole universe.
☐ Return to Earth sequence works.

Scientific/content

☐ Every published quantitative claim is verified, appropriately rounded, and uses correct units.
☐ Realistic renderings do not silently violate scale; enhancements are labeled.
☐ Reconstructed/illustrative/speculative representations are identified.
☐ Data sources and licenses are documented.
☐ Astronomical distances are not conflated with light travel time, altitude, or viewport width.

Technical/quality

☐ Static production build deploys to GitHub Pages without a backend.
☐ Core experience works on modern desktop and mobile browsers.
☐ Large assets load lazily and are released when no longer needed.
☐ Reduced-motion mode and keyboard-accessible controls are present.
☐ Graceful loading/error states; no blank canvas without explanation.
☐ Automated tests cover navigation state, unit formatting, content schema and transition logic.

9. Risks and mitigations

|Risk                                             |Mitigation                                                                                   |
|-------------------------------------------------|---------------------------------------------------------------------------------------------|
|Scene transitions look like unrelated slides     |Build four-scene vertical slice first; overlapping LOD and camera continuity.                |
|Precision/depth artifacts across scales          |Relative coordinates, floating origins, per-scene camera planes and scale-specific renderers.|
|Planets invisible at accurate distances          |Separate physical geometry from explicitly styled clickable labels/markers.                  |
|Misleading representation of Milky Way/cosmic web|Provenance metadata and visible explanatory labels.                                          |
|Large datasets and slow mobile loading           |Curate/preprocess catalog subsets; lazy load; adaptive quality.                              |
|Content accuracy and licensing errors            |Source review and asset manifest before release.                                             |
|Scope creep                                      |Ship guided journey before complex free exploration or speculative mode.                     |

10. Initial Codex instructions

1. Read this entire specification and inspect the existing repository before changing code.
2. Produce a short implementation plan with architecture decisions, dependencies, and milestone-sized tasks; call out uncertain assumptions.
3. Start with Phase 0 and the Phase 1 four-scene vertical slice. Do not implement all 18 stops immediately.
4. Use real astronomical scale relationships and clearly labeled visual approximations. Keep scientific data separate from rendering and UI code.
5. Favor reusable scene interfaces, deterministic transitions, and automated tests over one-off scene logic.
6. Validate by running the app, checking browser console errors, testing navigation and transitions, and inspecting actual rendered output. Test mobile layout.
7. Document external assets, license/attribution, and scientific sources.
8. After the vertical slice, report observed performance, visual limitations, remaining risks, and proposed next milestones before expanding scope.

11. Out of scope for initial release

• A complete physically simulated universe or orbital dynamics engine.
• Exact three-dimensional positions of every star and galaxy.
• A literal exterior view of the whole universe.
• Real-time astronomical ephemerides unless specifically added later.
• User accounts, payments, server-side rendering, or live AI APIs.

────────

Guiding sentence: Never force the visitor to read, but always reward the visitor who wants to know more.