# Phase 2A — property collection engineering and horizontal gallery

Continues draft [PR #26](https://github.com/huzshk0707/oaktown-rentals-website/pull/26) from Felix's `262f153`. Ravi's ownership checkpoint is `69d20fd`; the audit/card extraction milestone is `1ba68e8`. Gallery engineering checkpoint `b788bb4` is verified on the remote branch/PR. Read the current PR head for the final handoff checkpoint. **No merge or production deployment.**

The owner's subsequent gallery instruction is implemented: the existing introduction is a full-width row above one horizontal row of homes. The redundant View All Homes action and grid/gallery toggle are removed. All four catalogue homes remain reachable; final premium editorial styling awaits the owner/ChatGPT mockup.

## Reports

- [Every property's supported fields and missing facts](FIELDS.md).
- [Photography/network audit and safe future migration plan](PHOTOGRAPHY.md).
- [Exact 60-photo identity/order/source manifest](catalogue-audit.json).
- [Original-photo browser requests: 0/60 loaded locally](photo-request-results.json).
- [Hero and protected-system preservation checks](preservation-checks.json).

## Architecture and interaction contract

`property-cards.js` is a buildless reusable renderer with explicit collection size and a live language accessor. It retains exact unit names, links, CMS-escaped text/alt handling and current card markup/classes. Currency, availability, numeric specifications, empty-gallery fallback and exact-host responsive image helpers are shared with `app.js`. Missing numbers never silently become zero or `$NaN`; unknown availability gets no badge. No prose is promoted to a structured pet/parking field.

`collection.css` changes only collection layout. Original cinematic card width baseline is restored: **44vw desktop, 70vw at ≤850px, viewport minus 44px at ≤600px**, with the original brand photo ratios of 1.5 desktop / 1.3 mobile. Cards use `flex: 0 0 ...` and never expand to fill unused space. Current fonts/colors/details remain the provisional Signature styling. The introductory eyebrow, heading, description and inquiry guidance are retained above the gallery.

`collection.js` owns fit detection and intentional desktop edge movement. Existing `effects.js` continues to own bounded arrow/keyboard steps and existing perspective behavior. The controller:

- Shows arrows only when filtered content overflows; disables the arrow at each boundary. No wraparound or timed advance.
- Uses a maximum 160px/second, pointer-distance-scaled movement in an 80px edge zone; stops on leaving that zone, pointer exit/down, manual wheel/touch/keyboard input, page scroll, lost window focus, hidden document, resize, filter change or motion preference change.
- Uses animation frames only while deliberate edge movement is active, with bounded frame deltas; no idle animation loop or new dependency.
- Disables edge movement for one/two matching homes, reduced motion, motion-off and touch/coarse pointers. If fixed-width results fit, they remain left-aligned and stationary with no controls. If two cards exceed a narrow viewport, manual swipe/keyboard/arrows remain available without stretching or edge drift.
- Preserves native horizontal scrolling/touch swiping and visible scrollbar; the region is keyboard focusable. ArrowLeft/Right, Home and End work. No vertical wheel hijacking.
- Resets the strip instantly on filter changes. Browser Back/reload/detail return restores the exact previous position without a smooth-scroll race. Lifecycle cleanup cancels frames and observers/listeners on route/language changes.

Public and private-preview HTML load the two new scripts and collection stylesheet; `.assetsignore` and the disposable CMS test harness include them. `signature.js`, `signature.css`, the hero markup, `data.js`, CMS/auth/schema/worker, admin implementation and Mint Mojo remain unchanged from Felix's checkpoint. No live records, media, secrets or payment functionality were touched.

## Actual screenshots — photo limitation applies

All screenshots below are actual Chromium captures. **The CDN is blocked by this workspace's network tunnel. These are layout/error-state evidence, not final photography verification.** No substitute image was used. Full-page captures retain genuine local hero/story/vacation assets and clearly labelled missing collection photos.

| View | Before (`262f153`) | Current horizontal gallery |
| --- | --- | --- |
| Desktop collection | [Before](before-desktop-collection-CDN-unavailable.png) | [After](gallery-desktop-collection-CDN-unavailable.png) |
| Mobile collection | [Before](before-mobile-collection-CDN-unavailable.png) | [After](gallery-mobile-collection-CDN-unavailable.png) |
| Spanish mobile | [Before](before-mobile-es-collection-CDN-unavailable.png) | [After](gallery-mobile-es-collection-CDN-unavailable.png) |
| Spanish tablet | [Before](before-tablet-collection-CDN-unavailable.png) | [After](gallery-tablet-collection-CDN-unavailable.png) |

[Desktop full page](gallery-desktop-full-CDN-unavailable.png) · [Mobile full page](gallery-mobile-full-CDN-unavailable.png) · [Spanish mobile full page](gallery-mobile-es-full-CDN-unavailable.png) · [Tablet full page](gallery-tablet-full-CDN-unavailable.png).

[Desktop one-result alignment](gallery-desktop-one-result-CDN-unavailable.png) · [Spanish mobile one-result alignment](gallery-mobile-es-one-result-CDN-unavailable.png) · [Desktop Madison detail](gallery-desktop-madison-detail-CDN-unavailable.png) · [Spanish Madison detail](gallery-mobile-es-madison-detail-CDN-unavailable.png).

The four `gallery-*-hero.png` opening captures are **pixel-identical** to `before-*-hero.png`. The hero function and its dedicated CSS/JS are unchanged. Existing [Phase 1B three-scene screenshots and recording](../phase1b/README.md) remain the cinematic review evidence; its EN/ES forward/reverse motion was re-tested here.

`after-*-collection-*` and `browser-comparison.json` record the earlier **card extraction milestone**, before the later gallery instruction. They confirm unchanged copy and card geometry at that milestone, not the final layout. `gallery-*` is the latest gallery evidence.

## Verification

Run the static site on port 8930; browser commands below use `OAKTOWN_BASE_URL=http://127.0.0.1:8930`. All mutation tests use a disposable SQLite/bucket fixture, not production credentials/data.

| Command | Result |
| --- | --- |
| `npm run check` | Syntax passed, including both new scripts |
| `npm test` | 8 groups: 3 CMS/security + 5 reusable-card boundary tests |
| `node tests/collection.cjs` | 8 gallery groups: fixed widths, fit/one/two/zero, intent/stop/bounds, arrows/keyboard, filtering, motion toggle, resize/manual scroll, Spanish mobile touch/detail |
| `node tests/signature.cjs` | 19 groups, EN/ES across six widths, filter/history, every detail/gallery, local hero, resources, motion |
| `node tests/browser.cjs` | 45 public-browser checks |
| `node tests/design.cjs` | 33 supplemental checks, authoritative empty/outage and no-JS fallback |
| `node tests/browsing.cjs` | 24 gallery, selected-photo, touch, motion, dock and bilingual checks |
| `node tests/audit.cjs` | 15 exact history/reload/Back/Forward, filter, gallery and facts checks |
| `node tests/motion.cjs` | 9 Phase 1B camera, keyboard, EN/ES, mobile and reduced-motion groups |
| `node tests/mint-mojo.cjs` | Independent vacation regression passed |
| `npm run test:admin-browser` | Disposable admin draft/public isolation, upload, preview, publish/archive and responsive workflow passed |
| `npm run test:photo-order` | Mouse/touch/keyboard ordering, main photo, captions, draft isolation and busy-upload regressions passed |
| `npm run test:admin-improvements` | 6 admin improvement groups passed |
| `node tests/capture-collection.cjs` with `OAKTOWN_AXE_PATH` | Four viewport captures; 12 axe scans, zero confirmed violations; contrast incompletes retained in [accessibility.json](accessibility.json) |

Exact outputs are adjacent `*-tests.txt` files. Existing grid-toggle assertions were replaced with the newly approved single-row behavior; filtered and unfiltered history coverage remains. The motion test now waits for the expected scene rather than assuming an arbitrary 100ms is enough under concurrent Chromium load. No hero code change was required.

To reproduce captures, use `tests/capture-collection.cjs` for the current gallery. `tests/capture-phase2a.cjs` is the historical extraction comparison: serve `262f153` at `OAKTOWN_BEFORE_URL` and `1ba68e8` at `OAKTOWN_BASE_URL`; it intentionally asserts pre-gallery geometry equality. `scripts/audit-property-catalogue.mjs` regenerates the read-only catalogue manifest.

## Preview status

The existing review alias is https://felix-oaktown-signature-oaktown.rentals10.workers.dev/ . The latest engineering SHA is verified on GitHub, but at the final inspection its combined status was `pending` with no reported status/check runs. This environment cannot open the host through its proxy, so the latest hosted build and photos are **not independently verified**. A prior successful Phase 1B preview is not proof of this new checkpoint.

## Remaining acceptance and exact next step

- Hosted external photography still needs a CDN-enabled browser. Original image dimensions/quality, bandwidth and real-photo crop/contrast cannot be signed off from these fallback screenshots. There is no evidence here of a hosted Squarespace outage.
- Phase 1B owner visual acceptance and enhanced Afterglow architectural accuracy approval remain pending.
- Final Editorial Collection typography/composition/icons/action styling awaits the approved mockup. This engineering change does not authorize that redesign, a dedicated search page or a three-home inventory truncation.
- Native Safari/Firefox, assistive-technology reading and real production admin sign-in remain outside these local Chromium checks. Performance is bounded by lazy photos and intent-only animation; no real-device performance certification is claimed.

**NEXT STEP:** after checking live PR #26 ownership/head, use a CDN-enabled browser to open the draft preview, verify all 60 exact photos against `catalogue-audit.json`, and save loaded-photo desktop/mobile gallery evidence in this directory. Then await the owner/ChatGPT Phase 2B mockup before Phase 2C styling. Keep PR #26 draft.
