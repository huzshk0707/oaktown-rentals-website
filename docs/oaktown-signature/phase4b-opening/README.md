# Phase 4B step 1 — Property presentation and gallery

[Colonial Drive feature preview](https://felix-property-gallery-oaktown.rentals10.workers.dev/#home/115-colonial-drive) · [Draft PR #34](https://github.com/huzshk0707/oaktown-rentals-website/pull/34) · [Browser recording](gallery-walkthrough.webm)

The draft is stacked on PR #33 at cde58a6. The opening retains the exact-property tour link and groups the catalogue facts and canonical application in one panel. On a phone, the persistent actions appear once the visitor has passed the panel. Contact-only listings retain their update inquiry. The normal gallery keeps its timer, progress bar, selectable thumbnails and playback preference. Opening the viewer suspends that timer. Closing it gives the selected photo a fresh interval if playback was enabled and the gallery is visible.

| Browser capture | Desktop | Phone |
| --- | --- | --- |
| Opening before | [1440 × 900](before-desktop-opening.jpg) | [390 × 844](before-mobile-opening.jpg) |
| Opening and framed cover after | [Desktop](after-desktop-opening.jpg) | [Mobile](after-mobile-opening.jpg) |
| Rental information panel | [Desktop](after-desktop-panel.jpg) | [Mobile](after-mobile-panel.jpg) |
| Enlarged exterior | [Desktop](after-desktop-viewer-landscape.jpg) | [Portrait phone](after-mobile-viewer-landscape.jpg) · [Landscape phone](after-mobile-landscape-viewer-landscape.jpg) |
| Enlarged interior | [Desktop](after-desktop-viewer-portrait.jpg) | [Portrait phone](after-mobile-viewer-portrait.jpg) · [Landscape phone](after-mobile-landscape-viewer-portrait.jpg) |

[Inline gallery with slideshow controls](inline-gallery.jpg). Before captures used the Phase 4A runtime locally. After captures used the hosted branch preview in Chromium. Phone evidence uses emulated viewports.

## Photograph dimensions

Effective image dimensions in CSS pixels, rounded to the nearest pixel after fitting the original inside its frame. The source files retain their original resolution. On a portrait phone, empty space above and below a landscape photograph preserves the complete composition.

| Viewport and photo | Inline | Previous enlarged viewer | New enlarged viewer |
| --- | --- | --- | --- |
| desktop · 01 | 955 × 674 | 875 × 617 | 1276 × 900 |
| desktop · 02 | 505 × 674 | 463 × 617 | 675 × 900 |
| mobile · 01 | 350 × 247 | 358 × 252 | 390 × 275 |
| mobile · 02 | 239 × 318 | 358 × 477 | 390 × 520 |
| mobile-landscape · 01 | 376 × 265 | 186 × 131 | 553 × 390 |
| mobile-landscape · 02 | 199 × 265 | 99 × 131 | 293 × 390 |

[Full before measurements](before-dimensions.json) · [Full after measurements](after-dimensions.json)

The browser decoded all 19 Colonial originals in order and matched each hosted SHA-256 to its repository file. Photos 01 and 18 measure 960 × 677, photos 02–17 measure 480 × 640, and photo 19 measures 576 × 432. Verification used the previously imported approved repository assets as the reference. [Per-photo identity, dimensions and hashes](colonial-photos.json)

## Regression results

Node 24 and Chromium. The following commands passed during implementation with the local HTTP server on port 8956. Browser integration used normal certificate trust for remote catalogue photographs. The admin suite ran against its disposable harness.

- `npm run check` and `npm test` (11 unit tests).
- `node tests/NAME.cjs` for browser, browsing, signature, sky-header, collection, refinement, design, motion, mint-mojo, gallery-playback, verify-integration and admin-improvements.
- Six routes, 38 imported photo hashes, 68 ordered selections and eight viewport/language pairs passed. The 24 axe scans had zero confirmed violations and retain inconclusive checks. [Full results](catalogue.json)
- Rental viewer checks covered 19 forward selections, wrap, keyboard arrows, focus cycling, Escape, close-button restoration of the selected image, background scroll lock and a stationary viewer beyond a full autoplay interval. Both paused and playing inline preferences were checked. Vacation playback retained its existing dialog controls.
- Spanish reduced-motion mobile checks covered exactly one opening tour action, the independent application destination, contact-only handling, a failed photo followed by successful manual recovery, and both phone orientations.
- A browsing assertion initially sampled the moving header and listing dock mid-transition. The regression now waits for the transition before measuring their resting positions. The unit template harness now supplies the same icon provider as the app.

Feature runtime e95d39ffa45e8f27b18ad648bfcd0cb6a16c3dea. Next step is owner review of the opening and viewer. The lower sections and existing publication holds remain at their Phase 4A checkpoint.
