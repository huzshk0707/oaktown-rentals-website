# Oaktown motion and brand refinement

The follow-up to merged PR #8 restores the earlier cinematic character at the owner's request. PR #8 replaced the scroll-linked introduction with a static pale catalogue. This version brings back the original forest-green/cream palette, full-photo hero, chapter transitions and photo movement, with clearer spacing, refined display type and consistently sized controls.

## What to review

- A compact, three-chapter introduction on desktop. Scrolling and chapter controls synchronize the photograph, heading, description and progress indicator. The homes begin at 180svh on a full-height desktop.
- Mobile and reduced-motion layouts keep manual chapter selection. Short-phone sizing keeps the actions and chapter controls clear of the fixed bottom bar. The pause control persists and keeps the collection at its reading position when the hero changes height.
- Cream editorial/contact sections give the darker collection a readable rhythm. Cards retain complete addresses, rental facts, inquiry links, filters and grid/gallery selection. Listing facts still precede the complete gallery.
- The original logo, unit-specific photo sources and gallery order are preserved. The previously removed oversized footer wordmark stays removed.

## Local validation

- JavaScript syntax checks and the public browser suite passed, including restored scroll chapter assertions, EN/ES details, galleries, filters, showing links, responsive widths and motion persistence.
- 35 supplemental checks passed for bilingual calls to action, reachable navigation, keyboard chapter selection at six widths, authoritative CMS empty/outage behavior and no-JavaScript contact.
- 31 motion checks passed for synchronized scenes, collection reading-position preservation, manual mobile/reduced-motion behavior, header/action/chapter clearance in both languages and route listener cleanup. Phone clearance includes 320 × 640 and 390 × 640.
- Three CMS/security tests and the existing Mint Mojo browser suite passed.
- Wrangler deployment dry-run passed. This is a build check, not a production deployment.
- Local desktop and phone screenshots were inspected for typography, spacing, control clearance and failed-photo presentation.

## Visual limits

This running environment blocks `oaktown.rentals10.workers.dev` and the external photo CDN. Current screenshots therefore show the explicit photo-failure treatment, using the repository's static records. They do not establish current live inventory, live deployment behavior or final photo crops. The real-photo captures from PR #8 remain historical references; they are not fresh screenshots of this refinement. Review with the original photos loading, plus native Safari/Firefox and uncached network performance, remains outstanding.

| Local fallback layout | Capture |
| --- | --- |
| Desktop opening | [Desktop](screenshots/motion-desktop-fallback.png) |
| Desktop third chapter | [Third chapter](screenshots/motion-chapter-fallback.png) |
| Phone opening | [Phone](screenshots/motion-mobile-fallback.png) |
| Spanish, 320 × 640 | [Spanish phone](screenshots/motion-spanish-fallback.png) |

## Reproduce

Start `python3 -m http.server 8787 --bind 127.0.0.1` from the repository, then run:

```sh
npm run check
npm --prefix tests run check
npm test
OAKTOWN_BASE_URL=http://127.0.0.1:8787 npm --prefix tests run test:browser
OAKTOWN_BASE_URL=http://127.0.0.1:8787 npm --prefix tests run test:design
OAKTOWN_BASE_URL=http://127.0.0.1:8787 npm --prefix tests run test:motion
OAKTOWN_BASE_URL=http://127.0.0.1:8787 npm --prefix tests run test:mint
npx wrangler deploy --dry-run
```

Production merging/deployment remains subject to owner approval under `PRODUCT.md`. No production records, authentication, admin code or deployment settings were changed.
