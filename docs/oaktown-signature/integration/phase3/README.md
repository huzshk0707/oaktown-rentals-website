# Phase 3 integration and homepage design lock

The owner approved [PR #31](https://github.com/huzshk0707/oaktown-rentals-website/pull/31) at `1b751450e86ae1759647fc2c862acdb71d73f7e0` and authorized Felix to integrate it. [Draft PR #29](https://github.com/huzshk0707/oaktown-rentals-website/pull/29) now contains merge `495e284f089135ee42be16dd468648b45c970ca5`, based on the previously reviewed shared tip `4f5c3ea5ccb35f0589a566f26489b20d562827c7`. The only merge conflict was the handoff log. The merge tree otherwise matches the approved feature checkpoint. [Shared Cloudflare preview](https://integration-oaktown-signature-oaktown.rentals10.workers.dev/)

**Major homepage design is complete and locked.** Preserve the approved Phase 2E header and opening, Our Homes, the full-screen Louisville story, Your Rental Journey, the compact Lobster Nirvana feature and footer. Louisville uses the exact reviewed Option A WebP with the lighter overlay, local shade behind the copy and a documented Pexels license. Its SHA-256 is `69b2cfc78a06d84b702fddd86a5eddda91ec39b0fad8574b5b69d8ad598029b8`. The previous photograph and credit are absent from the homepage. The mobile automatic-darkening correction still produces ivory in all three tested modes. [Approved captures and contrast](../../phase3/final/README.md) · [Photo provenance](../../phase3/PHOTOGRAPHY.md)

The catalogue, rental assets, Phase 2E header/hero files, collection controls, CMS, admin, Mint Mojo and deployment configuration match the prior shared branch. Booking PR #25 remains separate. Production, live CMS and payments remain outside this integration.

## Verified catalogue

| Property | Imported files matching SHA-256 | Ordered selections loaded locally and on the preview |
| --- | ---: | ---: |
| 115 Colonial Drive | 19 | 19 |
| 4005 Smallboat Ct | 11 | 17 |
| 1106 Cherokee Rd · #8 | 0 | 9 |
| 1824 W Madison | 0 | 15 |
| 208 Sloemer Ave | 8 | 8 |
| 8008 Troutwood Ct | 0 | 0 |
| Total | 38 | 68 |

Troutwood is contact-only with a photo placeholder and no gallery. The browser checked all six exact routes and each selected image URL in order. The six held Smallboat slots retain their prior source photographs. [Local catalogue](catalogue-local.json) · [Hosted catalogue](catalogue-hosted.json)

## Integration checks

- All 17 regression commands passed with Node v24.22.1 and Chromium. `npm run check` and `npm test` passed, including 11 unit/CMS tests. With `OAKTOWN_BASE_URL=http://127.0.0.1:8947`, the header, public browser, design, Signature, motion, collection, Boutique, browsing, audit, refinement, Mint Mojo and gallery playback suites passed. The three admin browser and ordering suites used disposable fixtures. [Commands and transcripts](test-results/summary.json)
- `node tests/verify-integration.cjs` ran on the local server with `OAKTOWN_AXE_PATH=/tmp/signature-axe/node_modules/axe-core/axe.min.js` and `OAKTOWN_REPORT` pointed at the saved JSON. The hosted rerun used the same gallery assertions and Chromium same-origin fetch for asset and isolation checks. Normal TLS remained enabled. [Local and hosted transcripts](test-results/)
- `node tests/capture-homepage-completion.cjs` used the local server and the same axe path. The approved layout, language and disclosure checks passed. The 24 catalogue scans and 12 homepage scans found zero confirmed violations. Axe image/gradient contrast incompletes remain in the reports. The 32 rendered text contrast cases belong to the unchanged approved Phase 3 runtime. [Homepage scans](homepage-accessibility.json) · [Mobile colors and sampled pixels](painted-colors.json)
- Cloudflare built the merge. The shared root returned HTTP 200 and matched the repository HTML. Fifty-five served assets matched the integration commit, including the Louisville photograph, Phase 2E wordmark, four Afterglow sizes and all 38 imported rental photos. Preview isolation showed file mode, noindex, restrictive robots, admin API denial (503) and an excluded review photo (404). [Build](build.json) · [Hosted hashes and isolation](preview-assets.json)
- Hosted desktop English and mobile Spanish Chromium opened the approved sky header at the root, navigated to Louisville, decoded Option A without requesting the old image, and verified section order, keyboard disclosure, `/mint-mojo/` and the light color scheme. [Hosted homepage results](hosted-homepage.json)

## Remaining holds and next phase

- Confirm the enhanced Afterglow image’s architectural accuracy before release. Smallboat variants 03, 12 and 14–17 remain held for the documented condition, accuracy or reuse issues. Complete Colonial’s final photo review and the Madison and Cherokee #8 source, order and crop reviews. [Photo backlog and source decisions](../../../../TASKS.md#photography-and-content-backlog)
- Confirm Sloemer’s rent, deposit and availability. Troutwood still needs a genuine exterior and confirmed timing, renovated specifications and other terms. Public Zillow links remain unverified and the current property-specific SMS showing action remains available.
- Any move from the file catalogue to the live database needs approved facts, a compatible model/media plan and a separate staging rehearsal and publication approval. The current preview uses the file catalogue.

Await the owner’s property-detail design instructions. Start from [115 Colonial Drive](https://integration-oaktown-signature-oaktown.rentals10.workers.dev/#home/115-colonial-drive), with its 19 verified ordered photos, and use it as the reference for all six properties. The detail pages were verified in their existing form. Felix’s integration claim is released. PR #29 stays draft.
