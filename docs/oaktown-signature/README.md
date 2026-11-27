> Current review is [Phase 1B — continuous cinematic hero](phase1b/README.md). The following Phase 1 record is retained as the before-state and historical evidence.

# Oaktown Signature — Phase 1 visual review

Ravi continued the existing implementation on draft [PR #26](https://github.com/huzshk0707/oaktown-rentals-website/pull/26). The [12-phase roadmap](ROADMAP.md) records future direction without authorizing future phases. This delivery refines the opening and verifies the existing site; it does not independently redesign the remaining sections.

## Review the opening

- [Exact approved reference](references/04-approved-hero-exact-reference.png).
- [Desktop opening, 1672×941](screenshots/after-desktop.png).
- [Mobile opening, 390×844](screenshots/after-mobile.png).
- [Spanish mobile](screenshots/after-mobile-es.png) and [320px Spanish](screenshots/after-narrow-es.png).
- [Tablet](screenshots/after-tablet.png) and [Spanish desktop](screenshots/after-desktop-es.png).
- [Secondary Colonial photograph](screenshots/after-colonial.png).
- [Side-by-side review](comparison.html).
- Previous implementation at `19642db`: [desktop](screenshots/before-desktop.png), [mobile](screenshots/before-mobile.png).

These are actual Chromium captures. The opening uses the genuine local Afterglow photo and contains no photo substitutions. Search begins below the opening viewport. At the exact reference size, the hero is 941px high and search starts at 975px. Typography, left alignment, kicker underline, natural forest-green gradient and warm ivory CTA now follow the exact hero reference instead of the earlier compact mockup.

### Deliberate differences and remaining visual acceptance

The approved source photo is 1000×753 and visibly softer than the reference rendering. Its architecture, lawn, lighting and framing are preserved. Matching the rendering's changed house details or invented golden lighting would violate the authentic-photography requirement. A higher-resolution authorized original would improve large-screen sharpness. See [asset provenance](ASSETS.md).

The repository requires the original supplied Oaktown logo to remain unchanged. It remains in the header/footer; the reference's alternate oak-leaf wordmark has not been invented or extracted as a replacement brand asset. The approved Resources dropdown contains FAQ and Community. Resident Portal is absent. The existing motion toggle, EN/ES switch and secondary photo controls remain available.

The opening has been reviewed at the exact reference size and on tablet/mobile, including 320px Spanish. No horizontal overflow or hero CTA overlap was found in the tested sizes. The original compact view showed search and collection inside the first screen; the refined opening now reserves that screen for the photograph and headline. Creative acceptance remains with the owner and ChatGPT; this is still a draft.

## Photo-host limitation — fallback evidence only

The workspace's enforced restricted network policy does not include `images.squarespace-cdn.com`. A normal HTTPS request fails at proxy CONNECT with **403**, before reaching Squarespace. The single-host environment change request did not complete, and no settings were changed. This is not evidence that the production photo host is down. No proxy bypass, replacement property photo, production DNS, R2, inventory or Cloudflare setting was used to conceal it.

The genuine local Afterglow, Colonial, Louisville and Lobster Nirvana photographs load. Existing remote rental catalogue/gallery URLs remain unchanged. Full-page and rental-detail captures below are **CDN-unavailable fallback evidence, not final photo verification**:

- [Full desktop fallback](screenshots/after-desktop-full-cdn-unavailable.jpg).
- [Full mobile fallback](screenshots/after-mobile-full-cdn-unavailable.jpg).
- [Full Spanish mobile fallback](screenshots/after-mobile-es-full-cdn-unavailable.jpg).
- [Collection fallback](screenshots/after-collection-cdn-unavailable.png).
- [Desktop detail fallback](screenshots/detail-desktop-cdn-unavailable.png), [Spanish mobile detail fallback](screenshots/detail-mobile-es-cdn-unavailable.png).
- [Actual image load report](screenshots/capture-report.json).
- Genuine local section photos: [Louisville](screenshots/after-louisville.png), [Lobster Nirvana](screenshots/after-lobster.png).

The older main-branch captures in `../signature-review` also lack remote photos and are retained as historical fallback evidence. Final collection/gallery photo acceptance requires a browser with normal access to the existing CDN.

## Verification

Node 24, local Chromium; all admin writes use the disposable test harness.

| Command | Result |
| --- | --- |
| `npm run check` | Passed, including new Signature script syntax |
| `npm test` | 3 CMS/security groups passed |
| `OAKTOWN_BASE_URL=http://127.0.0.1:8930 node tests/signature.cjs` | 19 groups passed: combined search/reset/empty states, history, EN/ES, hero, resources, motion and all four gallery routes |
| `npm --prefix tests run test:browser` with the local base URL | 44 checks passed |
| `npm --prefix tests run test:design` | 32 checks passed, including empty/outage authority and no-JS contact |
| `npm --prefix tests run test:browsing` | 24 groups passed: slideshow scope, canceled navigation, off/reduce/touch fallbacks, gallery focus and detail dock |
| `npm --prefix tests run test:audit` | 15 groups passed: exact browsing/history positions, rental facts and bilingual layouts |
| `npm --prefix tests run test:motion` | 4 viewport/language groups passed: scroll offset, explicit photo selection, pause/resume stability and reduced motion |
| `npm run test:admin-browser` | Passed full disposable draft/publish/upload/preview/archive workflow |
| `npm run test:photo-order` | Passed mouse, touch and keyboard ordering and draft isolation |
| `npm run test:admin-improvements` | 6 groups passed, including real-page unsaved EN/ES previews |
| `npm --prefix tests run test:mint` | Passed existing vacation gallery, navigation, language and motion regression |
| `tests/capture-signature-accessibility.cjs` | 8 scans: zero confirmed violations; image/gradient contrast incompletes retained in [report](accessibility.json) |

Existing tests were adapted to the approved search form/two-photo opening, not deleted to hide failures. They caught and led to fixes for the sticky detail dock's header offset and detail-page contrast under the new shell. The private CMS harness now serves the new public CSS/JS, so preview tests exercise the actual presentation. Legacy `cinematic`, `opening` and `scroll-photos` scripts target the superseded pinned three-chapter design; current public/design/motion tests cover Signature instead.

No extra animation library, pinned scroll introduction, automatic hero timer or idle animation loop was added. Hero motion is event-driven, with a small capped transform and explicit photo selection. Responsive WebP assets retain original resolution limits. CDN-blocked local checks cannot establish uncached production image performance or native Safari/Firefox behavior.

## Reproduce

Run `python3 -m http.server 8930 --bind 127.0.0.1` from the repository. Set `OAKTOWN_BASE_URL=http://127.0.0.1:8930` for browser commands. `node tests/capture-signature.cjs` saves current screenshots. To capture the previous implementation, serve an isolated `git archive 19642db` on another port and set `OAKTOWN_BEFORE_URL` to it. No checkout reset is needed.

For accessibility captures, provide `OAKTOWN_AXE_PATH` pointing to an installed `axe-core/axe.min.js`, then run `node tests/capture-signature-accessibility.cjs`. The capture scripts use real local photographs and record remote failures; behavioral fixtures in older tests are not visual evidence.

## Preview and approval gates

Cloudflare's existing PR integration reports the preview alias:
https://felix-oaktown-signature-oaktown.rentals10.workers.dev

Use the latest Cloudflare PR check/comment to verify the deployed commit. The local workspace/web reader cannot independently open that preview URL, so a successful provider build is not represented as a live browser verification here.

Keep PR #26 draft. No production merge/deploy, live inventory/schema/auth changes or payment activation. Booking PR #25 remains separate. Before production, confirm Afterglow ownership/management and photo reuse authorization, review real CDN photos and obtain explicit merge/deployment approval.
