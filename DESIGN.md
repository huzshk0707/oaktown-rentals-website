# Oaktown public website design

## Direction

The original Oaktown forest-green and cream identity, with a cinematic photo opening and a carefully spaced rental catalogue. Full property photography, expressive Manrope headings and quiet rules provide the visual character; rent, addresses and contact actions remain easy to scan.

This direction follows the owner's request after PR #8 to restore the earlier motion and brand colors with a more polished finish.

## System

- Original tokens: forest `#123b25`, alternate green `#1c5030`, deep forest `#0b2c1a`, cream `#f3f5df`, secondary cream `#dce5c8`, muted `#c0d0b4`, primary brand green `#10783d`. The supplied logo remains unchanged.
- Existing self-hosted Manrope for display headings, DM Sans for body and controls, and the original italic serif phrases in all three hero chapters. Responsive headings and full addresses can wrap.
- Maximum content width 1280px, 22–24px phone/tablet gutters, deliberate section spacing, restrained photo zoom and thin dividing rules. Photos retain their natural colors.
- Dark green opening and collection, cream editorial/contact sections, and deep green navigation/footer. The oversized footer wordmark stays removed.
- With motion enabled and at least 560px of window height: one 160svh opening on desktop, or 140svh at widths up to 850px, with a sticky photo stage. Native scroll advances three synchronized photo/copy chapters with continuous zoom/pan (scale 1.12 to 1.04; vertical drift 1.2% to -1.2%). Phone stages leave room for the fixed actions and a clearer band of photography above the copy. Chapter buttons also select a chapter directly.
- Very short windows (under 560px high), reduced motion and a saved Motion off preference use a static introduction with manually selectable chapters. Motion state persists; pausing/resuming preserves the reading position in the collection. No timer, autoplay, wheel interception or idle animation loop.
- The photographic O bridges the last two chapters within the compact hero, behind the shade and copy. It reuses the decoded third-chapter image and is suppressed if that source is unavailable, motion is off, or the viewport is static/mobile.
- The collection keeps two-column comparison, neighborhood filters and the optional gallery with gentle perspective on desktop and phone gallery layouts. Detail pages retain clear title/rental facts and the complete, unobscured photo gallery.

## Property browsing

- Cards offer an on-demand additional photo from their own property. Fine-pointer hover and keyboard focus preview it; the explicit toggle also works on touch. A failed extra image leaves the main photo intact.
- Normal card navigation shares the chosen photo into a cover on the detail page using the native View Transitions API. Unsupported browsers, Motion off and reduced motion retain immediate navigation. Canceled transitions cannot write images into newer routes.
- The detail cover stays synchronized with the full gallery. Clicking it enlarges the image it displays.
- A compact rental bar appears once the full rental facts scroll behind the header. Desktop retains showing/application links; phones use the existing fixed bottom actions. It hides at the title, contact section and in very short windows, while keeping keyboard-focused actions available.
- Browser Back, Forward, reload and the listing's All rental homes link restore the relevant browsing state: neighborhood filter, grid/gallery layout, horizontal position, reading position and card focus. Gallery selection is retained on Forward. Entry-specific history state stores interface state only; returning does not replay reveal animations.
- Cards show the published deposit and availability status. Missing availability is explicitly unconfirmed. Listing facts explain that current availability and additional application, pet or other charges must be confirmed before applying. Existing application and showing destinations are preserved.

## Boundaries

Public refinements are scoped under `body.rental-site` in `brand.css`. Mint Mojo retains its separate design and motion. No production dependencies or new font requests.

Property records, source photographs, gallery ownership/order, public destinations, the CMS, admin and deployment configuration are preserved. Empty or failed CMS responses remain authoritative. Failed photographs have explicit fallback messages.

## Review

See [the three-version visual comparison](docs/redesign/comparison/README.md), [photo-browsing review](docs/browsing/README.md) and [audit follow-up comparison](docs/audit-fixes/README.md) for validation and visual limitations. The owner approved merging this public-site follow-up in chat. Future production changes retain the approval boundary in `PRODUCT.md`.
