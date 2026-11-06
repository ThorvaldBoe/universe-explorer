# Visual journey and imagery principles

This guide records the visual and production lessons from the Earth-to-Moon pilot. Use it when extending this journey or creating artwork and transitions for another scale. Keep the product and scientific requirements in [the initial specification](../initial-spec.md) and [README](../README.md) authoritative; this guide adds practical direction for the visual work.

## Build the sequence before polishing frames

- Sketch a storyboard of the whole sequence before generating polished images. Each frame should show what becomes visible at that scale and how it leads into the next one.
- Set a clear camera direction and composition for the sequence. For the road-to-space pilot, the camera looks straight down during ascent; the lunar approach keeps Earth in view and moves backward toward the Moon.
- Define the represented footprint for every frame before making it. The pilot expands the square view width by a factor of three per step: 1 m, 3 m, 9 m, 27 m, and so on. This means nine times as much area at each step. Decide what plausibly fits at that size rather than adding details because a frame feels empty.
- At close range, derive the size of recognizable objects from their real dimensions. For example, a 15–20 cm wide road marking should span about 15–20% of a 1 m-wide image.
- Allow more than one frame for a meaningful change in scale or setting. Early ascent needs enough intermediate views for street, block, and city details to register before the globe appears.

## Keep deep-zoom artwork continuous

- Preserve the previous frame as the registered center of the next 3×3 expansion. The surrounding content should add the context that belongs at the larger footprint while keeping the central subject in place.
- Plan neighboring content as one larger composition. Do not create unrelated final tiles and expect their edges to match. If rough tiles are used to explore coverage, assemble them first, downsample the complete image, and use that composite as the continuity reference for a harmonization pass.
- Check the center and all four edges at native size. Look for broken roads, doubled or abruptly cut structures, changed lighting, repeated patterns, and details that contradict the smaller-scale frame.
- Keep a consistent orientation, lighting direction, weather, and visual style across the sequence. A stable camera direction and recognizable center help make the zoom feel like movement through one place.
- Use a storyboard or scale guide as a reference for image generation. An image model can help create convincing illustrative imagery, but generated geography is not a survey or a precise depiction of a real location.

## Preserve sources and make delivery practical

- Save accepted high-quality source images in the repository, then create optimized runtime copies from those sources. Keep source and optimized assets clearly named and grouped by journey.
- Record which source image corresponds to each represented width and where that mapping is used in the app. The scale shown to visitors must describe the image's view width, not camera altitude or distance to an object.
- Use lightweight runtime formats where they maintain acceptable visual quality. Do not discard the source images needed to revise or regenerate the optimized versions.
- Mark generated or composed scenes as illustrations. Keep scientific labels and distances separate from the artwork; for example, label the mean Earth–Moon center separation as such rather than presenting it as the landing view's width.

## Make motion carry the story

- Treat each transition as camera movement through scale and space, not as two slides dissolving into one another. Coordinate camera motion, artwork handoffs, and interface copy so they describe the same moment.
- Keep the camera facing Earth during the final retreat toward the Moon. Stay upright; for the landing, let lunar ground rise from the lower edge while Earth remains above the horizon, then settle on the saved final Moon image.
- Make transitions reversible and deterministic. Check both directions and ensure the beginning and ending frames are stable when the motion completes or is interrupted.
- Keep explanatory text useful but unobtrusive. Show it by default, and let visitors hide or restore it with the dedicated text control.

## Inspect the experience at every step

- Review screenshots of every stop on desktop, tablet portrait, and phone layouts. Check image framing, readable text, touch controls, and whether interface panels cover important details.
- Watch a recording of the full journey in both directions. Look for sudden camera turns, jumps in orientation or scale, visible seams, abrupt handoffs, blank gaps, and a final view that differs from the approved artwork.
- Check reduced-motion behavior, keyboard and touch navigation, text visibility, browser errors, and WebGL availability as applicable. Automated Chromium captures are useful evidence, but still check on physical devices when available.
- Resolve visual problems before merging. A successful build alone does not show that the journey feels continuous.

## Current pilot reference

The current Earth-to-Moon artwork uses a saved road-to-Earth sequence with threefold view-width steps through the 129,140,163 m frame, then the saved lunar surface view with Earth above the horizon. The 387,420,489 m frame is intentionally omitted. The assets and runtime WebP copies live under `public/assets/road-zoom-pilot/`; implementation and frame metadata live in `src/scenes/deep-zoom-artwork.ts` and `src/data/stops.ts`.
