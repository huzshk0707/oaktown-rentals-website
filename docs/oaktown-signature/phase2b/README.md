# Phase 2B preparation — photography verified, editorial proposal ready

FELIX continued Ravi's `877d196` under explicit user reassignment, with ownership checkpoint `8e11623`. Draft [PR #26](https://github.com/huzshk0707/oaktown-rentals-website/pull/26) remains open for visual review. **All 60 original photos now load and match the catalogue and source listing order.** The public runtime is unchanged from Ravi's checkpoint.

**[Open the hosted preview](https://felix-oaktown-signature-oaktown.rentals10.workers.dev/#homes)** · [Photography verification](PHOTOGRAPHY.md) · [Detailed editorial proposal](EDITORIAL-PROPOSAL.md) · [Current/proposed comparison](editorial-comparison.jpg).

The preview shows the approved horizontal gallery with its current provisional styling. The proposed editorial treatment is only in labelled screenshots and the reversible browser capture script. It has not replaced the public styling.

## Actual browser evidence

All screenshots below were captured from the hosted Workers preview with original CDN photography, normal HTTPS checks and no substituted responses. The page is 1440px wide on desktop, 390px on mobile, and 320px for narrow Spanish. Full-section captures use a 1280px-tall viewport so screenshot tooling does not resize the page and change its horizontal scroll state. Existing regression tests also cover ordinary phone viewport heights and touch swipes.

| State | Desktop English | Mobile English | Mobile Spanish |
| --- | --- | --- | --- |
| Full Our Homes / all areas / left boundary | [Desktop](current-desktop-left.png) | [Mobile](current-mobile-left.png) | [Spanish](current-mobile-es-left.png) |
| Right boundary | [Desktop](current-desktop-right.png) | [Mobile](current-mobile-right.png) | [Spanish](current-mobile-es-right.png) |
| One result, Cherokee Triangle | [Desktop](current-desktop-one.png) | [Mobile](current-mobile-one.png) | [Spanish](current-mobile-es-one.png) |
| Two-result **review fixture** | [Desktop](current-desktop-two-review-fixture.png) | [Mobile](current-mobile-two-review-fixture.png) | [Spanish](current-mobile-es-two-review-fixture.png) |
| Editorial proposal, left | [Desktop](proposal-desktop-left.png) | [Mobile](proposal-mobile-left.png) | [Spanish](proposal-mobile-es-left.png) |
| Editorial proposal, right | [Desktop](proposal-desktop-right.png) | [Mobile](proposal-mobile-right.png) | [Spanish](proposal-mobile-es-right.png) |

[320px Spanish current](current-narrow-es-left.png) · [320px Spanish proposal](proposal-narrow-es-left.png).

**Two-result disclosure:** current single-neighborhood / minimum-bedroom / minimum-bathroom options do not produce an exact two-home subset. The capture adds a temporary combined “St. Matthews + Okolona (review fixture)” option to that browser's select and invokes the existing pipe-separated filter path. The two records and photos remain genuine; no inventory or shipped filter UI is changed. This verifies fixed-width, left-aligned two-card behavior without misrepresenting a currently available public filter.

| Detail gallery | Desktop | Spanish mobile |
| --- | --- | --- |
| Colonial | [View](detail-desktop-115-colonial-drive.png) | [View](detail-mobile-es-115-colonial-drive.png) |
| Smallboat | [View](detail-desktop-4005-smallboat-ct.png) | [View](detail-mobile-es-4005-smallboat-ct.png) |
| Cherokee **#8** | [View](detail-desktop-1106-cherokee-rd-unit-8.png) | [View](detail-mobile-es-1106-cherokee-rd-unit-8.png) |
| Madison | [View](detail-desktop-1824-w-madison.png) | [View](detail-mobile-es-1824-w-madison.png) |

**[Watch the 12.88-second gallery recording](horizontal-gallery-review.webm)**. Actual browser capture at 1440×1280 demonstrates pointer edge movement, arrow navigation, right-boundary stop, a one-home filter and reset. No horizontal slideshow timer is used. The saved WebM was decoded with ffmpeg, sampled visually, and played in an HTML video element. [Capture measurements](capture-report.json) record offsets, actual loaded images, fixed dimensions and no document overflow.

No new screenshot contains unavailable-photo fallbacks. The prior Phase 2A fallback evidence remains historical and is not the current review set.

## Verification

Node 24 / system Chromium. Local regressions used `OAKTOWN_BASE_URL=http://127.0.0.1:8932`. The prior 8931 listener returned an empty response after environment resume, so an isolated static server was started on 8932 without stopping other services. The complete suite then passed. Production mutations were never used; admin checks use disposable test fixtures.

| Command | Result |
| --- | --- |
| `npm run check` | PASS |
| `npm test` | PASS, 8 CMS/component groups |
| `node tests/collection.cjs` | PASS, 8 gallery/fit/keyboard/edge/touch/filter groups |
| `node tests/signature.cjs` | PASS, 19 groups |
| `node tests/browser.cjs` | PASS, 45 checks |
| `node tests/design.cjs` | PASS, 33 checks |
| `node tests/browsing.cjs` | PASS, 24 checks |
| `node tests/audit.cjs` | PASS, 15 history/filter/detail groups |
| `node tests/motion.cjs` | PASS, 9 cinematic EN/ES, forward/reverse and static/mobile groups |
| `node tests/mint-mojo.cjs` | PASS, independent vacation regression |
| `npm run test:admin-browser` | PASS, disposable admin workflow |
| `npm run test:photo-order` | PASS, mouse/touch/keyboard ordering and isolation |
| `npm run test:admin-improvements` | PASS, 6 groups |
| `node tests/verify-collection-photos.cjs` | PASS, hosted 60 originals + 60 ordered detail selections, 4 mappings, 7 deployed file hashes |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/signature-browsers node tests/capture-editorial-review.cjs` | PASS, 32 screenshots, recording and 16 axe scans |

[Exact test outputs and exit codes](test-results/) · [Axe findings](accessibility.json) · [Unchanged runtime/protected-file hashes](preservation-checks.json).

Sixteen scans found zero confirmed WCAG violations. Photo-overlay contrast incompletes are retained for manual review. This does not certify native Safari/Firefox, assistive-technology reading, retina photo quality or real production admin sign-in. Current and proposed screenshots were visually inspected; final aesthetic approval remains with the owner and ChatGPT.

Initial screenshot attempts used element/full-section capture that changed page geometry and horizontal position. The final capture uses a taller fixed viewport, checks that screenshotting preserves the exact offset, and replaces those attempts. “Right” images show Cherokee/Madison at the actual right boundary.

The protected-file comparison confirms no runtime edits to the hero, gallery controllers, data, CMS/auth, admin or vacation implementation. Files added are verification scripts, reports, review-only CSS and visual evidence. No migration, live inventory edit, production deployment, auth change or payment activation occurred.

## Exact next step

Owner and ChatGPT review `EDITORIAL-PROPOSAL.md`, `editorial-comparison.jpg` and the mobile proposal images, then approve or revise the detailed treatment before any public card-styling implementation. The original-photo loading blocker is resolved. Source-resolution/crop quality remains a visual limitation, and enhanced Afterglow architectural acceptance remains a separate gate. Keep PR #26 draft.
