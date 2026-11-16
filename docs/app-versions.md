# App versions

The experience selector exposes three preserved builds. Each version is a complete static build with its own base path and assets, so switching versions cannot mix scripts or imagery.

| Version | Source | Experience |
| --- | --- | --- |
| V1 | Git tag `v1` (`e6c65e3`) | Original four-scene proof of concept |
| V2 | Git tag `v2` (`a57c20d`) | Full journey as deployed before the deep zoom pilot |
| V3 | Current `main` | Current journey plus the deep zoom pilot |

V1 and V2 are frozen snapshots under `public/versions/`. Their tags pin the exact source commits. V3 is the maintained application at the site root. Future work should keep V1 and V2 intact and add another version or update V3 deliberately.

The app remains TypeScript and Vite. The 3 m pilot uses OpenSeadragon to read a standard Deep Zoom Image (DZI) tile pyramid generated from the existing harmonized composite. This demonstrates multiresolution tile delivery and continuous viewport motion, but does not claim to solve the image-art problem: the source master is 1,254 × 1,254 pixels. Higher-resolution masters with seamless, reviewed neighboring content are needed before extending the pilot into a production Earth ascent. Regenerate its tiles with `python3 -m pip install -r requirements-asset-tools.txt && python3 scripts/generate-dzi.py`. If future journeys need far more tile data than GitHub Pages can comfortably serve, move the immutable DZI trees to object storage or a tile CDN and keep their manifests in the app.

To regenerate archived builds, check out the tagged commits, install their declared package dependencies, and run Vite with the version base path (`/universe-explorer/versions/v1/` or `/universe-explorer/versions/v2/`). Those historical commits predate a committed npm lockfile, so the committed snapshots remain authoritative if dependency resolution later changes. Copy a rebuilt output to its matching `public/versions/` folder and add the shared `version-selector.js` script to its `index.html` before committing.
