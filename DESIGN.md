# Oaktown public website design

## Direction

The Oaktown green identity on white and warm cream surfaces, inspired by Mint Mojo, with a cinematic photo opening and a carefully spaced rental catalogue. Full property photography, expressive Manrope headings and quiet rules provide the visual character; rent, addresses and contact actions remain easy to scan. Dark forest green is reserved for primary actions rather than large section backgrounds.

This direction follows the owner's request to lighten the main website while retaining the earlier motion and green brand identity.

## System

- Light surfaces: white `#fffefb`, warm cream `#f3f3e8`, pale photo fallback `#e1e9dd`. Text: forest `#123b25`, secondary `#4b6255`; accent green `#10783d`. Buttons use deep forest `#0b2c1a` with white text and green hover. The header uses a forest-green typographic wordmark in the existing serif/body type system; the original supplied logo remains in the footer. The final scoped palette in `brand.css` adapts the legacy foreground tokens for this light presentation.
- Existing self-hosted Manrope for display headings, DM Sans for body and controls, and the original italic serif phrases in all three hero chapters. Responsive headings and full addresses can wrap.
- Maximum content width 1280px, 22–24px phone/tablet gutters, deliberate section spacing, restrained photo zoom and thin dividing rules. Photos retain their natural colors.
- White navigation, collection, FAQ, contact and property details (including the image-bearing listing header); warm cream editorial, community, vacation feature and footer. The header stays fixed for consistent focus/scroll clearance. The opening uses a directional light gradient beneath left-aligned copy/actions on desktop, leaving the right side naturally colored. Phone photographs retain a clear upper band with stronger tint behind copy and a small light location caption. One primary View homes action follows the hero copy; the mobile Text/Apply bar remains. The oversized footer wordmark stays removed.
- With motion enabled and at least 560px of window height: one 160svh opening on desktop, or 140svh at widths up to 850px, with a sticky photo stage. Native scroll advances three synchronized photo/copy chapters with continuous zoom/pan (scale 1.12 to 1.04; vertical drift 1.2% to -1.2%). Phone stages leave room for the fixed actions and a clearer band of photography above the copy. Chapter buttons also select a chapter directly.
- Very short windows (under 560px high), reduced motion and a saved Motion off preference use a static introduction with manually selectable chapters. Motion state persists; pausing/resuming preserves the reading position in the collection. No timer, autoplay, wheel interception or idle animation loop.
- The photographic O bridges the last two chapters within the compact hero, behind the shade and copy. It expands from the exact center of the photo using PR #1's quadratic zoom, with eased entry/exit and short settling transitions for wheel/trackpad steps. Reverse scrolling contracts it along the same path. It reuses the decoded third-chapter image and is suppressed if that source is unavailable, motion is off, or the viewport is static/mobile.
- The collection keeps two-column comparison, neighborhood filters and the optional gallery with gentle perspective on desktop and phone gallery layouts. The listing count reads as a plain number of homes; the Highlands filter explicitly includes Cherokee Triangle. Section labels run 01–05 from homes to contact; the hero's chapter numbers appear in its photo controls. Detail pages retain clear title/rental facts and the complete, unobscured photo gallery.

## Property browsing

- Cards offer an on-demand additional photo from their own property. Fine-pointer hover and keyboard focus preview it; the explicit toggle also works on touch. A failed extra image leaves the main photo intact.
- Normal card navigation shares the chosen photo into a cover on the detail page using the native View Transitions API. Unsupported browsers, Motion off and reduced motion retain immediate navigation. Canceled transitions cannot write images into newer routes.
- The detail cover stays synchronized with the full gallery. Clicking it enlarges the image it displays.
- A compact rental bar appears once the full rental facts scroll behind the header. Desktop retains showing/application links; phones use the existing fixed bottom actions. It hides at the title, contact section and in very short windows, while keeping keyboard-focused actions available.
- Browser Back, Forward, reload and the listing's All rental homes link restore the relevant browsing state: neighborhood filter, grid/gallery layout, horizontal position, reading position and card focus. Gallery selection is retained on Forward. Entry-specific history state stores interface state only; returning does not replay reveal animations.
- Cards show the published deposit and up to three amenities from that property's existing translated feature list, excluding repeated bedroom/bathroom/location lines. Published availability statuses retain clear labels; unknown availability uses one Check availability inquiry action without a duplicate unknown badge. Listing facts direct applicants to the team for availability and application, pet or other charges. Existing application and showing destinations are preserved.
- FAQ copy speaks directly as Oaktown and contains no migration notes or unverified turnaround promise. The footer uses factual location copy while retaining noindex/nofollow. Mint Mojo is a compact, distinct sister vacation property link below the Louisville contact section. Existing working email/phone details are preserved; new review claims, email addresses, floor areas and pet permissions require factual source material.

## Boundaries

Public refinements are scoped under `body.rental-site` in `brand.css`. Mint Mojo retains its separate design and motion. No production dependencies or new font requests.

Property records, source photographs, gallery ownership/order, public destinations, the CMS, admin and deployment configuration are preserved. Empty or failed CMS responses remain authoritative. Failed photographs have explicit fallback messages.

## Review

See [the three-version visual comparison](docs/redesign/comparison/README.md), [photo-browsing review](docs/browsing/README.md) and [audit follow-up comparison](docs/audit-fixes/README.md) for validation and visual limitations. The owner approved merging this public-site follow-up in chat. Future production changes retain the approval boundary in `PRODUCT.md`.

The [public polish review](docs/public-polish/README.md) records the subsequent copy, hero, header, rental-card and contrast refinements approved for merge by the owner.
