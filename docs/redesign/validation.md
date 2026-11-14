# Validation

Local review on 2026-11-14. Chromium is the installed `/usr/bin/chromium`. These checks do not establish production behavior, current availability or real-world CDN performance.

## Automated results

| Check | Result |
| --- | --- |
| Root and browser JavaScript syntax checks | Pass |
| CMS/security tests | 3 passed: signed Access validation, lifecycle/version/CSRF/private media checks, authoritative empty database |
| Public browser suite | 44 passed: galleries/focus, inquiries, filtering/grid/gallery, EN/ES, routes, no overflow at 320/390/768/1024/1440/1920, motion preferences |
| Supplemental design suite | 35 passed: visible hero CTA, reachable navigation, keyboard photo selection in both languages at six widths; CMS empty/outage; no-JavaScript contact |
| Admin browser workflow | Pass against disposable local harness: draft isolation, publication, photo upload/preview, archive, Spanish fallback, empty collection, responsive layouts |
| Mint Mojo browser suite | Pass: gallery/keyboard/focus, inquiry links, dates, EN/ES, navigation, motion and six viewport widths |
| axe-core 4.11.0, WCAG 2 A/AA + 2.1 AA + 2.2 AA tags | 0 confirmed violations across home/detail at desktop 1440 and phone 390; two gallery contrast nodes per detail scan remain “incomplete” |
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
- The combined Hallmark scan is **not passing**: it reports 201 FAIL, 193 REFLEX and 15 WARN at the evaluated snapshot. Many are retained, overridden legacy CSS or its prescribed stamp/token/word-count conventions. The rendered findings include blocked external photos, a preserved text-heavy content screen and a three-block hero (location, heading, description). The latter two are recorded design choices to retain content and local identity, not WCAG failures. Actual-photo failure is an open verification limitation. Do not describe this as a Hallmark-certified result.
- Impeccable source detection ran: 9 findings across five contrast warnings and four pattern advisories (kicker, cream palette, gradient text, dark glow). Its parser sees legacy declarations across all linked styles, including retired photo-letter/gradient rules. The rendered axe scan and manual inspection validate the current scoped colors; cream/green is an intentional brand decision. Impeccable's own browser launcher failed under this container's sandbox configuration, so there is no rendered Impeccable pass.
- The two axe incomplete gallery nodes involve image-backed controls. Their solid cream controls/dark text and focus were inspected, but the actual photo surfaces still need a CDN-enabled review.
- No new production libraries or fonts were added. Network-backed LCP, CLS and transfer measurements were **not** obtained; do not infer them from a local build or blocked-image test. Review native mobile Safari and Firefox before release; current automation uses Chromium.

## Remaining before approval

1. Apply network grants for `images.squarespace-cdn.com`, `oaktown.rentals10.workers.dev` and `api.github.com` in the environment settings. They are saved in the draft; the running environment still denies them with proxy HTTP 403.
2. Re-capture both designs with the real source photography, inspect cropping and photo-to-unit mapping visually, and review the current CMS-backed preview read-only. No stock stand-ins were used.
3. Open the prepared draft PR once GitHub API access works. A pushed branch comparison is not a pull request.
4. Owner reviews the design and PR. No merge or production deployment is authorized in this phase.

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

Capture defaults to blocking external requests and labels this in the review. After network access is available, set `OAKTOWN_CAPTURE_EXTERNAL=1` for real-photo captures. For “before”, serve an exported `9af551f` tree on a different local port and pass that base URL and the `before` argument. Never point the mutation-based admin harness at production.
