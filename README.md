# Universe Explorer

A browser-based journey from Earth to the observable universe. See [initial-spec.md](initial-spec.md) for product and scientific goals.

## Live preview

[Open Universe Explorer](https://thorvaldboe.github.io/universe-explorer/)

## Development workflow

### Branches and pull requests

- Use one focused branch per feature, fix, or documentation change. Name branches with a short category and topic, such as `feat/scale-transitions`, `fix/mobile-controls`, or `docs/development-standards`.
- Do not commit feature work directly to `main`. Keep each branch limited to one reviewable change.
- Open a pull request from the feature branch to `main`. Describe the change, why it is needed, how it was checked, and any known limitations. Link related issues when applicable.
- Review the diff and wait for required checks to pass. Fix any problems on the same branch.
- Merge approved, passing pull requests into `main`; delete the feature branch after merge when practical. Merging to `main` is the default workflow and is authorized for routine project changes.
- Keep pull requests small enough to understand and review. Split unrelated work into separate branches and pull requests.

### Implementation routine

1. Read the relevant specification and inspect the existing code before changing it.
2. Agree on a small milestone and acceptance criteria. Prefer reusable modules and data-driven content over scene-specific shortcuts.
3. Keep scientific facts, units, provenance, and references separate from rendering and interface code.
4. Implement incrementally. For the initial release, prioritize Phase 0 and the four-scene Phase 1 proof of concept. The current vertical slice pilots a continuous Earth-to-Moon journey. Its Earth ascent uses gradual street, neighborhood, city, atmosphere, continental, and orbital views before the lunar scene; validate its camera motion and scene handoffs before expanding to all 18 stops.
5. Run the checks relevant to the change, exercise the affected user flow, and report what was and was not verified in the pull request.
6. Update documentation, source/asset attribution, and this README when the change alters project conventions.
7. After the Phase 1 vertical slice, report performance observations, visual limitations, remaining risks, and proposed next milestones before expanding scope.

### Pre-merge visual review

Every pull request runs the production build and a headless Chromium review of every journey stop at desktop, iPad portrait, and phone sizes. The workflow attaches screenshots, WebGL availability reports, browser errors, and a forward journey recording as a downloadable artifact. Inspect these artifacts and resolve visual issues before merging; this review does not replace checking on physical devices.

## Scientific and visual standards

- Preserve real astronomical distance relationships and physical sizes where represented. Keep scene-local coordinates and camera framing appropriate to each scale; do not place the universe in one giant GPU coordinate space.
- Distinguish an object's physical geometry from a readability marker. Identify enlarged, brightened, or otherwise enhanced markers in the interface.
- Label content as observed/measured, reconstructed/modeled, illustrative, or speculative. In particular, identify the city and lunar landing scenes as illustrations, and distinguish them from observed planetary imagery.
- Distinguish visible width, object diameter, altitude, orbital distance, and light-travel time. Use appropriate units and sensible precision.
- Verify quantitative claims against authoritative sources. Record source links, asset origins, and license/attribution details alongside project content.
- Treat the city map and street panorama as AI-generated illustrations, not depictions of a specific real city. Build all aerial zoom levels and tiles from one master image; do not generate neighboring tiles independently. Keep the street panorama as one continuous source image and fade it into the matching master map during ascent.

## Engineering and accessibility standards

- Keep the app deployable as a static site on GitHub Pages, without a required backend or paid runtime service.
- Use TypeScript, Vite, and Three.js for the app foundation; keep interface controls in semantic HTML and CSS.
- Make transitions deterministic, skippable, and reversible through journey navigation. Interpolate logarithmic scale and blend scene levels of detail instead of linearly scaling raw astronomical distances.
- Support desktop and mobile layouts, keyboard and touch controls, readable focus states, and `prefers-reduced-motion`.
- Provide useful loading and WebGL failure states and a readable text fallback. Never leave the visitor with a blank canvas and no explanation.
- Load assets only as needed, dispose of unused GPU resources, and adapt rendering quality for device capability.

## Hosting

The live site is deployed to GitHub Pages from the `dist` build by the GitHub Actions workflow in `.github/workflows/pages.yml`. Keep the repository Pages source set to **GitHub Actions** so Pages serves the built files, not the raw TypeScript source.
