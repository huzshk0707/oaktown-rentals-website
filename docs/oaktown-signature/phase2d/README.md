# Phase 2D — visual and UX refinement

Review prepared 28 November 2026 (India time), FELIX. Continues Ravi `149217e` on **draft PR #26**. Main implementation checkpoint: `dd40325`. User approved the existing cinematic hero, Boutique cards and Our Homes identity; this phase preserves them.

**[Open the root preview](https://felix-oaktown-signature-oaktown.rentals10.workers.dev/)** — no `#homes` fragment. [Draft PR](https://github.com/huzshk0707/oaktown-rentals-website/pull/26).

## Implemented Tasks 1–4

- Fresh root and logo navigation open the hero. Intentional `#homes`, Browse Our Homes, refresh and Back/Forward work. Refresh at a saved reading position intentionally restores that position; no root bug was found and no positioning code was changed.
- Desktop security deposit 13px, neighborhood 14px, location 13px and specifications 15px. Narrow sizes adapt. Gallery stays 38vw; title/rent sizes and five-dot controls remain unchanged.
- Card action is **Request a Tour / Solicitar una visita**, using the existing exact-property SMS showing action. All four mappings checked, including Cherokee **#8**. [Zillow audit](ZILLOW.md): verified public links are pending from owner. No actual inquiries submitted.
- Gallery remains default; accessible Gallery/Grid buttons share the actual card DOM, facts, photos, filters and detail routes. Selection persists locally and in navigation history. Switching views preserves selected photos; grid disables horizontal gallery-only controls. Keyboard arrows/Home/End work on the segmented control. Grid is two columns on desktop, three on very wide screens and one on mobile.

## Actual browser evidence

These are Chromium screenshots of the implementation with genuine loaded photographs, not mockups. Original low-resolution listing photography remains unchanged.

| Review | Desktop | Mobile / Spanish |
| --- | --- | --- |
| Root opening | [Motion enabled](desktop-root-motion.png), [static fallback](desktop-root.png) | [Mobile](mobile-root.png), [Spanish](mobile-es-root.png) |
| Gallery and larger type | [First cards](desktop-gallery.png), [last cards](desktop-gallery-right.png) | [Mobile](mobile-gallery.png), [Spanish](mobile-es-gallery.png) |
| Grid | [All four homes](desktop-grid.png), [Spanish](desktop-es-grid.png) | [All four](mobile-grid.png), [Spanish](mobile-es-grid.png) |
| Shared filtering / tour action | [Cherokee #8](desktop-filtered-grid.png) | [Spanish](mobile-es-filtered-grid.png) |
| Separate expanding proposal | [Desktop](desktop-expanding.png) | [Mobile accordion](mobile-expanding.png) |
| Separate Louisville proposal | [Desktop map](desktop-louisville.png), [vacation transition](desktop-louisville-transition.png) | [Photo](mobile-louisville.png), [map](mobile-louisville-map.png), [Spanish transition](mobile-es-louisville-transition.png) |

Compare with the unchanged previous [Phase 2C screenshots](../phase2c/README.md). Main card differences are supporting type, tour wording and the view selector; the hero and remaining homepage sections retain their approved design.

Recordings: [Grid/Gallery, filter and tour target](grid-gallery-tours.webm), [expanding panels and neighborhood-to-collection flow](separate-prototypes.webm), [root opening, photo persistence and logo return](root-opening-photo-persistence.webm). SMS navigation was deliberately prevented in the recording harness after capturing the destination; no message was sent. This is destination/interaction verification, not an OS SMS-client end-to-end test.

## Separate proposals, awaiting creative approval

[Research and proposal notes](PROPOSALS.md) document Bethune's actual behavior, neighborhood sources, map provider/privacy/performance/cost and photography attribution. Neither proposal replaces the live review homepage. They reside under excluded `docs/` and are not in deployed static assets.

To try them from a checkout, run `python3 -m http.server 8933 --bind 127.0.0.1` in the repository and open `http://127.0.0.1:8933/docs/oaktown-signature/phase2d/prototypes/`. The toolbar switches the reversible iframe review between proposals and the approved page. No catalogue/schema migration is needed. The public preview remains the implementation of Tasks 1–4.

## Exact validation

Node 24; Playwright Chromium `/usr/bin/chromium`. Local public server `http://127.0.0.1:8933`; browser commands use `OAKTOWN_BASE_URL` where supported. See [command/exit summary](test-results/summary.json) and individual text logs.

| Command | Result |
| --- | --- |
| `npm run check` | Pass |
| `npm test` | 8 CMS/component groups pass |
| `node tests/refinement.cjs` | 12 groups pass locally **and on hosted preview** |
| `node tests/boutique.cjs` | 7 groups pass |
| `node tests/collection.cjs` | 8 groups pass |
| `node tests/signature.cjs` | 19 groups pass |
| `node tests/browser.cjs` | 45 checks pass |
| `node tests/design.cjs` | 33 checks pass |
| `node tests/browsing.cjs` | 24 groups pass |
| `node tests/audit.cjs` | 15 checks pass |
| `node tests/motion.cjs` | 9 groups pass |
| `node tests/mint-mojo.cjs` | Pass |
| `npm run test:admin-browser` | Pass, disposable local fixture |
| `npm run test:photo-order` | Mouse/touch/keyboard ordering pass |
| `npm run test:admin-improvements` | 6 groups pass |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/signature-browsers node tests/capture-refinement.cjs` | Screenshots/two recordings and 12 axe scans pass |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/signature-browsers node tests/proposal-review.cjs` | Three groups: desktop/mobile Spanish proposal interactions, reduced motion, credits, map-free fallback/filter, transition and selected-photo persistence pass |

Capture tooling additionally needs axe-core (`OAKTOWN_AXE_PATH`, defaults to this environment's `/tmp/signature-axe/node_modules/axe-core/axe.min.js`) and Playwright's video encoder. [Accessibility results](accessibility.json): zero confirmed WCAG A/AA violations in 12 collection/proposal scans; image/gradient contrast incompletes are preserved for manual review. Not a full accessibility conformance claim.

The first refinement run failed because its test waited for a filtered-out first card to become visible. Corrected the test to wait for DOM attachment; rerun passed without a runtime fix. A visual review found a mobile proposal photo-height specificity conflict; corrected only the isolated prototype and refreshed captures/scans. Final user-facing runtime equals `dd40325`.

Cloudflare [build succeeded](preview-build.json). [Eight served file hashes](hosted-verification.json) match this branch; [hosted navigation/grid/tour regression](test-results/hosted-refinement.txt) passes all 12 groups with normal TLS. Python urllib was rejected with HTTP 403; standard curl and Chromium successfully verified the preview. No TLS bypass or website infrastructure change. Earlier Phase 2C verified all 60 originals; this phase rechecked real selected-photo persistence without changing the photo manifest.

## Remaining decisions and handoff

- Owner will supply public Zillow rental links later; verify exact address/unit, active rental status and supported contact workflow before replacing SMS. Rents/deposits/availability remain unchanged.
- Leslie/owner chooses preferred Gallery/Grid presentation and reviews the **separate** panel and Louisville proposals before any larger section implementation.
- Existing enhanced Afterglow architectural approval remains a production gate; provenance is retained in [Phase 1B](../phase1b/README.md). No image generation or architecture change in this phase.
- Source image resolution/cropping remains limited as documented in Phase 2C. Native Safari/Firefox, physical devices, screen readers and real production admin sign-in were not tested.

**NEXT STEP:** review the root preview, `desktop-expanding.png`, `desktop-louisville.png` and `separate-prototypes.webm`; provide acceptance or specific revisions for Tasks 1–4 and each separate proposal. No unfinished runtime implementation. Keep PR #26 draft; no merge/production deployment, live inventory/auth/schema/payment changes. Booking PR #25 is untouched.

**Evidence recovery note:** The prototype vacation color correction follows the saved transition screenshots. Its recapture attempt stopped at the panel selection assertion before reaching the transition scan. Previous passing results above describe the recorded runs and do not cover that last prototype-only color change.
