# Validation

Local review on 2026-11-14. Chromium is the installed `/usr/bin/chromium`. The existing behavior suite uses local/disposable data; the photo review uses a read-only public snapshot. These checks do not establish current availability, native Safari/Firefox behavior or uncached browser/CDN performance.

## Automated results

| Check | Result |
| --- | --- |
| Root and browser JavaScript syntax checks | Pass |
| CMS/security tests | 3 passed: signed Access validation, lifecycle/version/CSRF/private media checks, authoritative empty database |
| Public browser suite | 44 passed: galleries/focus, inquiries, filtering/grid/gallery, EN/ES, routes, no overflow at 320/390/768/1024/1440/1920, motion preferences |
| Supplemental design suite | 35 passed: visible hero CTA, reachable navigation, keyboard photo selection in both languages at six widths; CMS empty/outage; no-JavaScript contact |
| Admin browser workflow | Pass against disposable local harness: draft isolation, publication, photo upload/preview, archive, Spanish fallback, empty collection, responsive layouts |
| Mint Mojo browser suite | Pass: gallery/keyboard/focus, inquiry links, dates, EN/ES, navigation, motion and six viewport widths |
| axe-core 4.11.0, WCAG 2 A/AA + 2.1 AA + 2.2 AA tags | 0 confirmed violations in six real-photo cases: home/detail at 1440/390, home at 768 and Spanish home at 320; two gallery contrast nodes per detail scan remain “incomplete” |
| Published photo integrity | 39/39 decoded across four properties; every gallery URL/order matches its published property; selecting the last photo opens the correct source |
| Read-only live checks | Public `/api/properties` returns 200 with four database-backed records; anonymous `/admin/` redirects with 302 |
| Wrangler dry-run | Pass; Worker bundle 51.48 KiB / 14.28 KiB gzip. This is a local build only, not a deployment or a public-page performance score. |
| Protected file comparison | No changes to admin, CMS, content adapter, property records, original assets, migrations, bindings, Access or deployment configuration |
| Whitespace/diff check | Pass |

The original baseline passed 43 public checks. Assertions tied to the retired scroll-pinned hero were deliberately replaced with manual-photo and static-introduction assertions. The full gallery, filters, bilingual details, focus restoration, inquiry, route, responsive and persistence coverage remains. An extra assertion verifies scrolling does not change the selected photo.

## Design review

An independent Hallmark-style finish reviewer inspected screenshots, source changes and actual rendered layouts. Findings fixed:

- Lightbox focus ring changed from brown (2.87:1 against the dark surface) to cream.
- Mobile hero photo selection was partly under the fixed action bar. The photograph's responsive height now leaves the controls above it at 390 × 844; keyboard checks also covered Spanish 320 × 640.
- Hero responsive `sizes` now describes its actual desktop half-page slot. Local/R2 images no longer receive misleading repeated width descriptors.

The first manual pass also fixed mobile header crowding, excessive listing-intro height and failed-image message contrast. The header remains reachable while reading long listings. Subtle motion is explicit, and reduced motion retains all controls.

## Tool findings and limits

- Hallmark static + rendered scan ran using a temporary Chromium wrapper matching the repository's existing no-sandbox test mode. The URL render worked; its separate `file://` attempt was blocked. Before/after source inventory retained **12/12 links and 11/11 script hooks** in the checked HTML; the broader dynamic behaviors are covered by the browser tests.
- The combined Hallmark scan is **not passing**: it reports 201 FAIL, 193 REFLEX and 15 WARN at the evaluated snapshot. Many are retained, overridden legacy CSS or its prescribed stamp/token/word-count conventions. The rendered findings include blocked external photos, a preserved text-heavy content screen and a three-block hero (location, heading, description). The latter two are recorded design choices to retain content and local identity, not WCAG failures. The photo-loading finding was resolved for this review by the real-photo captures below. Do not describe this as a Hallmark-certified result.
- Impeccable source detection ran: 9 findings across five contrast warnings and four pattern advisories (kicker, cream palette, gradient text, dark glow). Its parser sees legacy declarations across all linked styles, including retired photo-letter/gradient rules. The rendered axe scan and manual inspection validate the current scoped colors; cream/green is an intentional brand decision. Impeccable's own browser launcher failed under this container's sandbox configuration, so there is no rendered Impeccable pass.
- The two axe incomplete gallery nodes involve image-backed controls. Their solid cream controls/dark text and focus were inspected, and the real-photo review found the gallery labels readable on their solid surfaces. The automated incomplete results remain recorded, not converted to passes.
- No new production libraries or fonts were added. Network-backed LCP, CLS and transfer measurements were **not** obtained; do not infer them from a local build or blocked-image test. Review native mobile Safari and Firefox before release; current automation uses Chromium.

## Real-photo review after permissions were applied

The user applied the environment permissions on 2026-11-14. GitHub API, the public preview and source-photo downloads now work. Production records were read only. Before captures use `main` at `d6fee49`; after captures use this review branch and the same public API snapshot.

The container's Chromium still rejects the environment HTTPS proxy certificate. TLS validation was not disabled. Instead, a normal TLS-verified HTTP client downloaded all 39 source photos, and Playwright supplied those original bytes for the same source URLs in both local previews. These captures check layout, crops, labels and photo ownership; they are not measurements of browser TLS configuration or live CDN latency.

Each gallery's complete list and order were compared with its own published record; all thumbnails decoded, and selecting the last photo resolved to the right source. Counts: Colonial Drive 14, Cherokee #6 8, Smallboat Court 7, Cherokee #8 10. Original source resolution is preserved; some interiors are lower resolution than the Colonial exterior. No AI enhancement or replacement photographs were used.

The screenshot runner now waits for image decoding and fonts. Eager captures use the explicit responsive-size fallback and disable animations to avoid Chromium omitting offscreen image rasterization in full-page screenshots. Product styles and source image selections are unchanged by this capture-only adjustment.

Six accessibility scans with the real photographs recorded zero confirmed A/AA violations and no horizontal overflow. The independent reviewer checked hero crops and responsive balance at desktop, tablet and phone sizes, including Spanish at 320px. Detailed results accompany this document in `axe-results.json` and `photo-review.json`.

## Remaining before production

1. Owner reviews the PR and design.
2. Test native Safari and Firefox before release; current automation uses Chromium.
3. Measure uncached network-backed performance on the approved preview or release environment. No LCP/CLS score is claimed from local mirrored-photo captures.
4. Merge and production deployment require explicit owner approval. No admin redesign implementation is included.

## Reproduce

```sh
python3 -m http.server 8794 --bind 127.0.0.1
npm run check
npm --prefix tests run check
npm test
OAKTOWN_BASE_URL=http://127.0.0.1:8794 npm --prefix tests run test:browser
OAKTOWN_BASE_URL=http://127.0.0.1:8794 npm --prefix tests run test:design
OAKTOWN_BASE_URL=http://127.0.0.1:8794 npm --prefix tests run test:mint
NODE_PATH="$PWD/tests/node_modules" npm run test:admin-browser
OAKTOWN_BASE_URL=http://127.0.0.1:8794 npm --prefix tests run capture:design -- after
```

Capture defaults to blocking external requests and labels this in the review. Set `OAKTOWN_CAPTURE_EXTERNAL=1` for real-photo captures. `OAKTOWN_CONTENT_SNAPSHOT` optionally points to a read-only API JSON snapshot; `OAKTOWN_PHOTO_MANIFEST` maps source photo URLs to TLS-verified local byte files with `path` and `contentType` fields. For “before”, serve an exported `d6fee49` tree on a different local port and pass that base URL and the `before` argument. Never point the mutation-based admin harness at production.
