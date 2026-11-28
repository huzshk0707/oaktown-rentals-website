# Phase 3 final refinement

The owner approved the section order, fullscreen Rooted in Louisville layout and Option A. The updated [feature preview](https://felix-homepage-completion-oaktown.rentals10.workers.dev/) uses the exact 2400 × 1348 review WebP of the Louisville skyline and Ohio River, by K (@kelly on Pexels). The asset SHA-256 is `69b2cfc78a06d84b702fddd86a5eddda91ec39b0fad8574b5b69d8ad598029b8`. The homepage replaces the original photograph and its credit together. The prior photo and license record remain available for historical review. [Source and license evidence](../PHOTOGRAPHY.md)

The overall forest-green overlay is lighter, with desktop shade behind the copy that follows the disclosure as it expands. The story uses the approved crops. The accepted opening, homes collection, rental journey, vacation feature, footer and mobile automatic-darkening correction carry forward. Runtime changes are confined to the Louisville photo, its old credit and the section's CSS.

| View | Desktop | Mobile |
| --- | --- | --- |
| Rooted in Louisville | [English](desktop-louisville.jpg) · [Spanish](desktop-es-louisville.jpg) | [English](mobile-louisville.jpg) · [Spanish](mobile-es-louisville.jpg) |
| Full homepage | [English](after-desktop-full.jpg) · [Spanish](after-desktop-es-full.jpg) | [English](after-mobile-full.jpg) · [Spanish](after-mobile-es-full.jpg) |
| Louisville to Rental Journey | [Desktop](desktop-louisville-to-journey.jpg) | [Mobile](mobile-louisville-to-journey.jpg) |
| Rental Journey to Lobster Nirvana | [Desktop](desktop-journey-to-nirvana.jpg) | [Mobile](mobile-journey-to-nirvana.jpg) |

The captures use Chromium and reduced motion so each section is visible in a single still. [Previous credited version and Phase 3 layout review](../README.md)

## Verification

- Ten local regression commands passed. These included `npm run check`, `npm test` (11 unit/CMS tests) and the current header, browser, design, Signature, motion, audit, collection and refinement suites. Browser suites used `OAKTOWN_BASE_URL=http://127.0.0.1:8946`. [Commands and exit codes](test-results/summary.json)
- `OAKTOWN_AXE_PATH=/tmp/signature-axe/node_modules/axe-core/axe.min.js node tests/capture-homepage-completion.cjs` checked the section order and image, captured both languages and recorded 12 axe scans with zero confirmed violations. Photo and gradient contrast incompletes remain in the scans. [Axe results](accessibility.json)
- Rendered contrast sampling compared the computed foreground to every background pixel in each rendered text rectangle with the text paint made transparent. All 32 EN/ES cases passed across eight widths (320–1920px) and both disclosure states. The lowest measured heading ratio was 5.76:1 against 3:1 for large text. The lowest regular text ratio was 6.06:1 against 4.5:1. [Measurements](contrast.json)
- Mobile automatic darkening, ordinary dark preference and light mode painted the same ivory pixel at the tested collection margin. The computed `light only` scheme, collection ivory, champagne price gradient and theme color retained their values. Native Safari and physical phones were outside this check. [Computed values](after-mobile-colors.json) · [Paint samples](painted-colors.json)
- Cloudflare built runtime commit `433c47d937e616571e94f9a0712d295461953c54`. The preview root, 50 served file hashes including the Option A image, file mode, noindex, admin denial and review asset exclusion passed. Desktop EN and mobile ES Chromium confirmed the accepted root opening, navigation into Louisville, the new decoded photo, absence of the previous image request and its credit, section order and keyboard disclosure. [Build](build.json) · [Asset check](preview-assets.json) · [Hosted browser check](hosted-browser.json)

## Handoff

Review [draft PR #31](https://github.com/huzshk0707/oaktown-rentals-website/pull/31) and the final preview. Ravi can integrate into the shared draft only after owner authorization. The shared integration branch and production remain unchanged.
