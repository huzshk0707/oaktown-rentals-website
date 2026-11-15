# Audit follow-up: browsing continuity and rental clarity

This implements the owner's approved follow-up to the usability audit in PR #13. It retains the current forest-green/cream identity and cinematic photo chapters. Admin redesign remains a [separate proposal](../redesign/admin-proposal.md).

## Changes

- **Return to the same place.** Back, Forward, reload and All rental homes restore the relevant filter, grid/gallery layout, horizontal position, reading position and card focus. Forward also restores the selected listing photo. Same-page anchors and history entries with identical URLs are covered. Position is anchored to content where possible so layout changes do not send readers to an unrelated section. Returning skips reveal animations; user input cancels pending font/layout corrections.
- **Reach rentals sooner on phones.** The opening keeps all three scroll-driven photo chapters, with a shorter journey to the collection. A clearer photo band above the phone headline reveals more of the original photograph. Shorter introduction copy and tighter collection controls bring cards forward. Fixed phone actions, short-window layouts, English/Spanish and Motion off/reduced-motion paths remain supported.
- **Explain rental facts before applying.** Cards now include the published security deposit. Availability is shown explicitly on cards and listings; records without a confirmed status say Availability unconfirmed (and the Spanish equivalent). The listing fact block asks applicants to confirm current availability and additional application, pet or other charges. No fees, availability, rent, deposits or features were invented or changed.

The previous audit's photo-placement measurement concerned an earlier layout. Both versions compared here already show a property photograph in the opening. These changes improve its visibility and shorten the distance to the actual listing cards.

## Before/after comparison

Before is PR #13 commit `0aede63`, immediately before this audit follow-up. Both versions use the same read-only snapshot of four published properties, original CDN photo bytes and settled self-hosted fonts. Measurements are document positions in CSS pixels, with the reveal transform excluded from card positions. They describe these exact viewports and content, not every device.

| View | Homes section before → after | First card before → after | Clear photo band before → after |
| --- | --- | --- | --- |
| Desktop 1440 × 1000, English | 1800 → 1600 | 2187 → 1987 | 222 → 222 |
| Phone 390 × 844, English | 1519 → 1182 | 2034 → 1598 | 118 → 186 |
| Phone 320 × 640, Spanish | 1152 → 896 | 1760 → 1376 | 74 → 88 |

The clear photo band is the gap between the header's bottom and the main hero copy. All compared views loaded their original photo and had no horizontal document overflow. See [raw measurements](metrics.json).

| View | Before | After |
| --- | --- | --- |
| Desktop opening | [Before](before-desktop-hero.png) | [After](after-desktop-hero.png) |
| Desktop collection | [Before](before-desktop-homes.png) | [After](after-desktop-homes.png) |
| Phone opening | [Before](before-phone-hero.png) | [After](after-phone-hero.png) |
| Phone collection | [Before](before-phone-homes.png) | [After](after-phone-homes.png) |
| Spanish small-phone opening | [Before](before-small-phone-es-hero.png) | [After](after-small-phone-es-hero.png) |
| Spanish small-phone collection | [Before](before-small-phone-es-homes.png) | [After](after-small-phone-es-homes.png) |

Rental facts and application guidance: [desktop](after-desktop-costs.png), [phone](after-phone-costs.png), [Spanish small phone](after-small-phone-es-costs.png). Listing introductions: [desktop](after-desktop-listing.png), [phone](after-phone-listing.png), [Spanish small phone](after-small-phone-es-listing.png).

The browser uses local copies of the identical original CDN bytes because its proxy certificate trust differs from the HTTP client. Original downloads used TLS verification. No production photo/data writes occur. These captures do not measure uncached network performance.

## Validation

- **15 new audit checks:** grid/gallery Back restoration, reload, explicit return link, keyboard focus, horizontal position, filters, same-home anchor restoration, traversal across identical URLs, Forward gallery/reading position, mobile photo visibility, deposits, availability and fee guidance.
- **20 browsing checks** for photo previews, ownership, keyboard/touch behavior, native/shared-photo and fallback navigation, canceled callbacks, synchronized gallery/cover and compact rental-bar clearance.
- Existing suites passed: **46 public browser**, **35 responsive design**, **31 motion**, **18 cinematic**, **19 opening** and **73 scroll-photo** checks. The **3 CMS/security tests**, disposable admin browser workflow, Mint Mojo suite and syntax checks also passed. No production data was used for write tests.
- **Nine settled real-photo axe scans** across home, collection and listing views at desktop, phone and Spanish small-phone sizes reported zero confirmed WCAG A/AA violations. Some image-backed contrast checks remain incomplete and require manual review; the captured controls and text were visually checked. See [full results](accessibility.json). Automated scans do not establish complete accessibility conformance.
- Independent review verified the rendered-filter restoration fix and identical-hash history traversal. No unresolved material issues remained in that review.

Native Safari/Firefox device testing and uncached LCP/CLS benchmarking remain unverified. Additional charges and availability remain subject to confirmation by Oaktown when no authoritative values exist.

## Reproduction

Serve the working tree locally and commit `0aede63` separately for comparison, then run:

```sh
OAKTOWN_BASE_URL=http://127.0.0.1:8811 npm --prefix tests run test:audit
OAKTOWN_BASE_URL=http://127.0.0.1:8811 \
OAKTOWN_BEFORE_URL=http://127.0.0.1:8812 \
OAKTOWN_PHOTO_MANIFEST=/path/to/source-photo-manifest.json \
OAKTOWN_CONTENT_SNAPSHOT=/path/to/public-properties-snapshot.json \
OAKTOWN_AXE_PATH=/path/to/axe.min.js \
npm --prefix tests run capture:audit
```

The capture script reads the public snapshot and writes review artifacts only. The manifest maps each original source URL to a local `path` and `contentType`.

Public presentation and tests/documentation are the only changed surfaces. APIs, routing destinations, property records, source photographs, CMS/admin workflows, authentication, secrets, migrations and deployment configuration remain intact. Existing photo previews, shared-photo transitions and persistent rental facts are included in the same PR.
