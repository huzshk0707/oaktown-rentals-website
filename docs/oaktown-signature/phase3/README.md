# Phase 3 — Homepage Completion

This records the layout review before the owner selected Option A. See the [final refinement](final/README.md) for current captures, verification and the deployed photo.

Review prepared 28 November 2026. [Draft PR #31](https://github.com/huzshk0707/oaktown-rentals-website/pull/31) · [Feature preview](https://felix-homepage-completion-oaktown.rentals10.workers.dev/)

Felix started from verified shared checkpoint `4f5c3ea5ccb35f0589a566f26489b20d562827c7`. Approved Phase 2E PR #30 checkpoint `f5a2476` is an ancestor via merge `48a32cd`. Shared PR #29 remains draft. Phase 3 runtime checkpoint `d3216c94d6e02342ee252e592ad5bcc9186ea165` is deployed on the feature preview.

The homepage flows from the cinematic hero and Our Homes through a standalone Louisville panorama, Your Rental Journey, the compact Lobster Nirvana feature and the original footer. At 1440 × 900 Louisville measures 900px tall. At 390px the photo and story become a shorter natural section. The Our Story link, More about Oaktown disclosure and contact route work in both languages. The story copy uses the existing short reveal and is fully visible with reduced motion. The viewport presentation uses native scrolling with no additional scroll system.

The three existing journey steps retain their wording. Their spacing and supporting type make the ivory band readable between the two photographic sections. The original Lobster Nirvana photo, copy and `/mint-mojo/` destination follow it. Header HTML, header/cinematic scripts, collection code, data, all asset files, private admin, CMS, booking code and deployment configuration match the integrated baseline. The `app.js` change reorders the existing journey and vacation markup.

## Browser evidence

| View | Before | After |
| --- | --- | --- |
| Full desktop | [Integration baseline](before-desktop-full.jpg) | [English](after-desktop-full.jpg), [Spanish](after-desktop-es-full.jpg) |
| Full mobile | [Integration baseline](before-mobile-full.jpg) | [English](after-mobile-full.jpg), [Spanish](after-mobile-es-full.jpg) |
| Rooted in Louisville from Our Story | In the full baseline captures | [Desktop](desktop-louisville.jpg), [desktop Spanish](desktop-es-louisville.jpg), [mobile](mobile-louisville.jpg), [mobile Spanish](mobile-es-louisville.jpg) |
| Louisville into Rental Journey | In the full baseline captures | [Desktop](desktop-louisville-to-journey.jpg), [mobile](mobile-louisville-to-journey.jpg) |
| Rental Journey into Lobster Nirvana | In the full baseline captures | [Desktop](desktop-journey-to-nirvana.jpg), [mobile](mobile-journey-to-nirvana.jpg) |

The full-page and detail images use reduced motion so each section stays visible in one still. The [7.48-second browser recording](homepage-scroll.webm) goes from the opening through the three scroll scenes, homes, Louisville, journey, vacation and footer with motion enabled. FFmpeg decoded the entire 1440 × 900 VP8 recording. [Photo options and source licenses](PHOTOGRAPHY.md) link all three alternatives and six actual section captures. Each alternative was substituted only in the capture browser.

## Mobile background investigation

Chromium's automatic darkening reproduced the reported brown look at 390 × 844. The CSS computed collection color stayed `rgb(246, 243, 233)` but the painted outer margin changed from approximately `rgb(246, 244, 232)` to `rgb(39, 36, 29)` in the JPEG sample. The ordinary `prefers-color-scheme: dark` emulation left the fill ivory. The root and rental body declared `color-scheme: light`, which allowed Chromium's forced darkening to recolor these pixels. With `color-scheme: only light`, the forced-dark screenshot has the same ivory sample as the light and ordinary dark runs. [Before](before-mobile-forced-dark.jpg) · [after](after-mobile-forced-dark.jpg) · [Pixel samples](painted-colors.json)

The CSS background cascade retains its existing `#fffefb` paper, `#f6f3e9` collection ivory and champagne price gradient (`#f8f1de` to `#f5e8c8`). The mobile breakpoints change geometry and retain those fills. The `#F7F4ED` theme-color remains a browser-chrome hint. The capture checks the webpage pixels, not the system toolbar. The same phone, native Safari and vendor-level darkening modes were unavailable. The owner's specific phone rendering remains unconfirmed without its browser and screenshot. [Computed baseline](before-mobile-colors.json) · [Computed final](after-mobile-colors.json)

## Verification

Node 24.22.1 and Chromium at `/usr/bin/chromium`. The local fixture server ran at `http://127.0.0.1:8946`. The baseline capture used the separate integration worktree at port 8945 with identical runtime to `4f5c3ea`. `npm ci` could not write its default cache in this sandbox, so the checks reused already-installed versions of `jose` and Playwright from the other repository checkout. No dependency or lockfile changed.

- `npm run check` and `npm test` passed. The unit suite covered 11 CMS, security, renderer and expansion checks.
- `OAKTOWN_BASE_URL=http://127.0.0.1:8946 node tests/<suite>.cjs` passed for `sky-header` (27), `browser` (45), `signature` (19), `design` (33), `refinement` (12), `motion` (9), `collection` (8), `boutique` (7), `browsing` (24) and `audit` (15). `mint-mojo` and `gallery-playback` also passed. Header behavior includes original wordmark, hero buttons, menu timing, keyboard, EN/ES, responsive navigation and reduced motion.
- `npm run test:admin-browser`, `npm run test:photo-order`, and `npm run test:admin-improvements` passed with disposable fixtures. [Exact commands and exit codes](test-results/summary.json)
- `OAKTOWN_BASE_URL=http://127.0.0.1:8946 OAKTOWN_AXE_PATH=/tmp/signature-axe/node_modules/axe-core/axe.min.js OAKTOWN_REPORT=docs/oaktown-signature/phase3/catalogue-verification.json node tests/verify-integration.cjs` passed with six records, 38 imported photo hashes and 68 actual ordered image selections. Twenty-four axe scans found zero confirmed violations. [Catalogue evidence](catalogue-verification.json)
- `OAKTOWN_BASE_URL=http://127.0.0.1:8945 node tests/capture-homepage-completion.cjs --before` and `OAKTOWN_AXE_PATH=/tmp/signature-axe/node_modules/axe-core/axe.min.js node tests/capture-homepage-completion.cjs` captured actual EN/ES layouts and checked order, viewport size, story disclosure and attribution. Twelve section scans found zero confirmed violations. Axe gradient contrast incompletes are retained. [Section accessibility](accessibility.json)
- `PLAYWRIGHT_BROWSERS_PATH=/tmp/signature-browsers node tests/capture-louisville-review.cjs` captured all three proposals in desktop and phone widths and the native scroll recording. The first capture attempt used an incomplete mouse wheel argument. The final capture completed after supplying both axes. [Capture transcripts](test-results/)

Cloudflare successfully built `d3216c9`. The shared and feature preview each returned HTTP 200 at the root, matched the root HTML and 49 served file hashes including all 38 imported photos, returned file mode and noindex, denied the admin API and excluded the review images. Chromium verified that the feature opens at the accepted transparent header and that Our Story takes visitors to the 900px Louisville section, followed by a 238px rental journey and 340px vacation feature. Normal TLS remained enabled. The Playwright HTTP client hit an IPv6 routing error on shared-preview byte requests. Standard curl verified the hosted bytes. [Build](build.json) · [Shared preview check](shared-preview.json) · [Feature preview check](feature-preview.json)

## Next step

Review the feature preview and compare A, B and C in [PHOTOGRAPHY.md](PHOTOGRAPHY.md). Approve the homepage layout and one photograph, or record specific revisions. Only a subsequent approved change should switch the live review asset and remove the old image's visible credit along with that asset. Keep #31 and #29 draft. All property, media, Afterglow and CMS publication holds continue.
