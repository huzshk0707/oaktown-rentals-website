# Phase 4B Step 2 — Universal public navigation

[Draft PR #35](https://github.com/huzshk0707/oaktown-rentals-website/pull/35) · [Cloudflare feature preview](https://felix-universal-navigation-oaktown.rentals10.workers.dev/) · [Browser journey](navigation.webm)

The draft is stacked on the Property Gallery draft #34 at `b483547`. Ravi resumed Felix’s published runtime at `4fd38e9`. The reusable Signature header renders on the rental site, the vacation page and the existing recovery page. Lobster Nirvana keeps The Stay, Photos, Island Life and Ask About Dates in a separate local bar. The Colonial opening and its manual fullscreen viewer are shared by the listing pages, with each property’s own photos, facts and actions. Sloemer retains Ask for pricing and has no confirmed availability badge. Troutwood retains its photo-pending frame and update inquiry.

## Route verification and captures

Chromium rendered the hosted preview at 1440 × 900 and 390 × 844. Each route passed the same logo geometry, global labels, reduced-motion controls, layout and header accessibility assertions. The photographic opening uses the sky treatment. The remaining tested routes use ivory. Mobile captures use an emulated touch viewport.

| Route | Desktop | Mobile | Verified behavior |
| --- | --- | --- | --- |
| `/` | [Capture](desktop-home.jpg) | [Capture](mobile-home.jpg) | Cinematic opening with global header |
| `/#homes` | [Capture](desktop-homes.jpg) | [Capture](mobile-homes.jpg) | Rental collection and dynamic property links |
| `/#about` | [Capture](desktop-story.jpg) | [Capture](mobile-story.jpg) | Direct Our Story destination |
| `/#faq` | [Capture](desktop-faq.jpg) | [Capture](mobile-faq.jpg) | Resources link and FAQ content |
| `/#community` | [Capture](desktop-community.jpg) | [Capture](mobile-community.jpg) | Resources link and community content |
| `/#contact` | [Capture](desktop-contact.jpg) | [Capture](mobile-contact.jpg) | Resources link and existing contact action |
| `/mint-mojo/` | [Capture](desktop-lobster-nirvana.jpg) | [Capture](mobile-lobster-nirvana.jpg) | Shared header and four vacation section links |
| `/404.html` | [Capture](desktop-404.jpg) | [Capture](mobile-404.jpg) | Existing recovery page and home link |
| `/#home/115-colonial-drive` | [Capture](desktop-115-colonial-drive.jpg) | [Capture](mobile-115-colonial-drive.jpg) | 19 selections, original landscape and portrait viewer, and application link |
| `/#home/4005-smallboat-ct` | [Capture](desktop-4005-smallboat-ct.jpg) | [Capture](mobile-4005-smallboat-ct.jpg) | 17 selections and correct tour/application actions |
| `/#home/1106-cherokee-rd-unit-8` | [Capture](desktop-1106-cherokee-rd-unit-8.jpg) | [Capture](mobile-1106-cherokee-rd-unit-8.jpg) | Nine selections and unit #8 details |
| `/#home/1824-w-madison` | [Capture](desktop-1824-w-madison.jpg) | [Capture](mobile-1824-w-madison.jpg) | 15 selections and Madison details |
| `/#home/208-sloemer-ave` | [Capture](desktop-208-sloemer-ave.jpg) | [Capture](mobile-208-sloemer-ave.jpg) | Eight selections and unconfirmed terms preserved |
| `/#home/8008-troutwood-ct` | [Capture](desktop-8008-troutwood-ct.jpg) | [Capture](mobile-8008-troutwood-ct.jpg) | Contact-only, no gallery or application action |

Lobster Nirvana before and after: [desktop before](before-desktop-lobster-nirvana.jpg) and [desktop after](desktop-lobster-nirvana.jpg), [mobile before](before-mobile-lobster-nirvana.jpg) and [mobile after](mobile-lobster-nirvana.jpg). The before captures use the actual #34 runtime locally. The after captures use the deployed #35 runtime. The [13.72-second recording](navigation.webm) goes from the homepage through Colonial and Smallboat to Lobster Nirvana, then through FAQ, Community and Our Homes. It checks browser Back and Forward, Spanish and motion preferences, and the restored Smallboat photo and scroll position. FFmpeg decoded the complete recording.

## Test and hosted results

- `npm run check` and `npm test` passed on Node 24. The unit run includes 11 tests.
- `node tests/universal-nav.cjs` passed locally and on hosted Chromium. It covers the 14 routes, menu hover/touch/keyboard behavior, header consistency, native image proportions and cross-document history. History waits for navigation commit because Chrome can restore a page whose load event has already fired.
- `node tests/verify-integration.cjs` passed. It opened all 68 genuine selections across six homes and matched all 38 imported images, the catalogue and 12 runtime assets to repository bytes. The verifier uses Chromium’s network session for requests and SHA-256 checks. The hosted preview returned the file-mode catalogue and noindex, denied the private admin API and excluded review files.
- Standard HTTPS GET confirmed exact copies of the homepage, vacation and recovery HTML. The existing browser, design, Signature, motion, collection, boutique, refinement, browsing, audit, gallery playback, Mint Mojo, prototype and disposable admin suites passed. The audit checks the underlying Spanish tour label independently of the approved uppercase styling. `gallery-playback.cjs` verified inline pause/restore, keyboard and manual fullscreen behavior.
- There were 52 axe scans with zero confirmed violations across [28 header states](navigation-checks.json) and [24 catalogue states](hosted-catalogue.json). The reports retain inconclusive automated checks. [Test transcripts](test-results).

To reproduce the hosted checks, set `OAKTOWN_BASE_URL` to the [feature preview](https://felix-universal-navigation-oaktown.rentals10.workers.dev/) without a trailing slash and `OAKTOWN_AXE_PATH` to the installed `axe.min.js`. Run `node tests/universal-nav.cjs` and `node tests/verify-integration.cjs`. Set `OAKTOWN_EVIDENCE`, `OAKTOWN_VIDEO_DIR` and `OAKTOWN_REPORT` to collect captures, recording and catalogue JSON. Playwright recording uses FFmpeg.

## Integration order for review

The #32 vacation homepage feature was combined with #35 in a disposable Git tree and smoke-tested at both widths. Runtime files merged cleanly, and `HANDOFF.md` and `TASKS.md` would need both branches’ entries retained. Await owner integration authorization. Land the property stack in dependency order #33 → #34 → #35, retargeting each child to `integration/oaktown-signature` after its parent lands. Integrate independent #32 after the stack, then rerun the complete journey on the combined preview. Preserve the existing branches and the photo publication holds. Booking PR #25 remains separate.
