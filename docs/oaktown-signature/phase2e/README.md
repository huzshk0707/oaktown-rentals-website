# Phase 2E — Seamless Sky Header

Ravi implemented the approved inline [layout reference](approved-layout.svg) on [draft PR #30](https://github.com/huzshk0707/oaktown-rentals-website/pull/30) from integration `c4a789b`. [Feature preview](https://ravi-seamless-sky-header-oaktown.rentals10.workers.dev/). PR #29 is the combined release draft.

The full-bleed Afterglow stage now extends behind a transparent header with a feathered ivory veil. The original wordmark sits at the upper left; the four desktop destinations sit toward the right. The existing left-aligned headline, photograph, three scroll-linked scenes, discovery guidance and Scroll to Explore remain. The opening pairs a sage Browse Our Homes button with an outlined Apply Now link using the existing canonical destination. On smaller screens, the same disclosures open by tap within a scrollable panel.

Our Homes derives its links from the existing public catalogue loader, independent of active collection filters. Published database results replace the file catalogue. Empty or unavailable database results leave Browse All Homes and no individual links. All six integrated records keep their exact detail routes. Lofts & Nirvana currently contains the sole verified destination, Lobster Nirvana at `/mint-mojo/`. The repository has no separate Lofts destination. Resources contains FAQ, Community and Contact. The direction-sensitive reveal is desktop-only, starts after the hero, holds when focus or interaction is in the header, and turns off with reduced motion. Detail and resource routes keep a visible ivory header.

## Browser comparison

| View | Reviewed base | Phase 2E |
| --- | --- | --- |
| Desktop, 1440×900 | [Before](before-1440.jpg) | [After](opening-1440-en.jpg) |
| Phone, 390×844 | [Before](before-390.jpg) | [After](opening-390-en.jpg) |

The reference shows the desired composition over a wide, bright sky. The real Afterglow photograph has sky at the left and tree canopy across the upper right. The shipped composition uses a translucent feathered veil for dark navigation text across the real photograph. The existing editorial headline remains warm ivory over localized shading. The original image bytes, camera engine and stage geometry are unchanged.

- Desktop opening [1920×1080](opening-1920-en.jpg), [1440 Spanish](opening-1440-es.jpg), [1366×520 static fallback](opening-1366-en.jpg).
- Desktop interaction [Our Homes](homes-dropdown.jpg), [Lofts & Nirvana](lofts-nirvana-dropdown.jpg), [Resources](resources-dropdown.jpg), [Our Story underline](story-underline.jpg).
- Cinematic [scene two](scene-2.jpg), [scene three](scene-3.jpg), [ivory below the hero](below-hero.jpg), [Colonial detail](property-detail.jpg).
- Responsive [tablet](opening-768-en.jpg), [tablet menu](mobile-properties-768-en.jpg), [390px English menu](mobile-menu-390-en.jpg), [390px Spanish opening](opening-390-es.jpg), [390px Spanish homes](mobile-properties-390-es.jpg), [320px Spanish opening](opening-320-es.jpg), [320px Spanish homes](mobile-properties-320-es.jpg).
- Reduced motion [desktop English](reduced-1440-en.jpg), [phone Spanish](reduced-390-es.jpg).
- [Actual browser recording](header-interactions.webm) shows the opening, three disclosures, both later scenes and directional header behavior. The 12.04-second VP8 WebM played in Chromium without a decode error.
- [Capture and axe report](capture-report.json).

All images above show an actual Chromium session on the local static server using the existing real site imagery. The before captures were taken from the exact integration checkout before modifying its runtime. The feature captures use the separate worktree. No photograph was substituted.

## Brand and typography

The original 1200×608 JPEG has a modal background of RGB 19, 140, 71 (`#138C47`). Existing companion tokens include `#10783D` and the Signature deep green `#082E22`. The new header uses scope-local `#F7F4ED` ivory, `#30362C` neutral and `#475A37` dark olive for emphasized navigation. The light sage action is `#A8BA8B` with dark text, while the disclosure top accent follows the reference `#8C9F65`. These olive tones are derived from the approved direction.

The 480×243 PNG is a deterministic raster extraction from the original JPEG. Its alpha derives from the red-channel separation of the pale original artwork and saturated green background, with source dimensions retained proportionally. The ink is `#465C30`, selected for readable contrast over the sky. The mark was neither redrawn nor retypeset. The original JPEG remains in the repo and still renders in the footer and private preview.

[Live Bethune observations](../BETHUNE-MOTION-STUDY.md#phase-2e-typography-and-navigation-observation) distinguish loaded Raleway navigation from the declared Italiana hero face that the environment could not load. The new navigation uses existing self-hosted DM Sans and the hero retains Georgia with Times New Roman/serif fallback. See the [included DM Sans license](../../../assets/fonts/dm-sans-LICENSE.txt). No new font, animation package or network dependency was added.

## Verification

Node 24.22.1 and system Chromium. Exact outputs are in [test-results](test-results).

Run the public browser suites with `OAKTOWN_BASE_URL=http://127.0.0.1:8944` against `python3 -m http.server 8944 --bind 127.0.0.1`. The disposable admin suites start their own harnesses.

| Command | Coverage |
| --- | --- |
| `npm run check`, `npm test` | Syntax and 11 CMS/security, card and property-expansion groups |
| `node tests/sky-header.cjs` | 25 checks. Transparent stage, original-derived logo, EN/ES navigation, hover, keyboard/touch, scroll states, file/empty/unavailable/published catalogue behavior and history |
| `node tests/browser.cjs`, `node tests/signature.cjs`, `node tests/design.cjs` | 45, 19 and 33 browser/design/Signature checks |
| `node tests/collection.cjs`, `node tests/boutique.cjs`, `node tests/browsing.cjs`, `node tests/audit.cjs` | 8, 7, 24 and 15 collection, gallery and history checks |
| `node tests/motion.cjs`, `node tests/refinement.cjs`, `node tests/junior-proposal-review.cjs` | 9, 12 and 3 cinematic and prototype checks |
| `node tests/admin-browser.cjs`, `node tests/admin-photo-order.cjs`, `node tests/admin-improvements.cjs` | Editor, photo ordering and six editor refinements in disposable fixtures |
| `node tests/mint-mojo.cjs`, `node tests/gallery-playback.cjs` | Independent vacation site, links, galleries, history and playback |
| `OAKTOWN_AXE_PATH=/path/to/axe.min.js OAKTOWN_REPORT=/tmp/catalogue.json node tests/verify-integration.cjs` | All six listings, 38 exact imported hashes, 68 genuine photo selections and 24 catalogue accessibility scans |
| `OAKTOWN_AXE_PATH=/path/to/axe.min.js node tests/capture-sky-header.cjs` | 26 after screenshots, 19 header/hero axe scans, video. Requires Playwright ffmpeg |

Older tests now target the existing Browse Our Homes action explicitly because the opening has two links. The history and Mint Mojo suites now open the corresponding disclosure before following the same destination, and the root reload test waits for the existing saved history record before reloading. [Preservation report](preservation.json) verifies the catalogue/media, cinematic engine and styles, collection, CMS, admin and Mint Mojo are byte-identical to the reviewed base. [Catalogue verification](catalogue-verification.json) records the exact browser results. The two accessibility passes report zero confirmed violations across 43 scans.

## Hosted status and review holds

The pre-implementation baseline command was `OAKTOWN_BASE_URL=https://integration-oaktown-signature-oaktown.rentals10.workers.dev OAKTOWN_REPORT=/tmp/hosted-integration.json node tests/verify-integration.cjs`. It failed at the initial Chromium navigation with `net::ERR_TUNNEL_CONNECTION_FAILED`. The network grant for both preview hostnames did not complete. The connected Cloudflare build/deployment is visible in the PR, while direct served hashes, file mode, admin denial, robots/noindex and deployed exclusion checks are still pending. Source checks retain the existing preview bindings and noindex rules. The asset allowlist adds only the public header CSS and JS, with the mark inside the existing public assets tree.

[Photographic contrast samples](pixel-contrast.json) measured actual backing pixels across text rectangles. Across ten Spanish viewport/scene combinations, the lowest sampled navigation ratio was 6.13:1 and supporting copy 5.6:1. One full large-heading rectangle includes a 2.90:1 background pixel. These conservative rectangular samples include areas between letters and supplement the visual review and axe output. Chromium was tested with simulated touch, along with representative short and narrow viewports. Native Safari/Firefox and screen-reader sessions were outside the verification pass.

Existing publication holds still apply. Sloemer rent/deposit/availability, Troutwood exterior and January 2027 wording/specs, Smallboat edits 03, 12 and 14–17, Afterglow architectural accuracy, Zillow destinations and the file-to-database migration remain open. Booking #25 keeps its independent staging gate.

**Next step:** Open [the feature preview](https://ravi-seamless-sky-header-oaktown.rentals10.workers.dev/) at desktop width, open Our Homes and scroll through all three scenes. Review the original mark, dropdown composition and ivory transition against the [before/after captures](#browser-comparison), then record acceptance or requested revisions on PR #30 before authorizing integration.
