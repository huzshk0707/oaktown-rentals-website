# Oaktown public website design

## Direction

The original Oaktown forest-green and cream identity, with a cinematic photo opening and a carefully spaced rental catalogue. Full property photography, expressive Manrope headings and quiet rules provide the visual character; rent, addresses and contact actions remain easy to scan.

This direction follows the owner's request after PR #8 to restore the earlier motion and brand colors with a more polished finish.

## System

- Original tokens: forest `#123b25`, alternate green `#1c5030`, deep forest `#0b2c1a`, cream `#f3f5df`, secondary cream `#dce5c8`, muted `#c0d0b4`, primary brand green `#10783d`. The supplied logo remains unchanged.
- Existing self-hosted Manrope for display headings, DM Sans for body and controls, and the original italic serif phrases in all three hero chapters. Responsive headings and full addresses can wrap.
- Maximum content width 1280px, 22–24px phone/tablet gutters, deliberate section spacing, restrained photo zoom and thin dividing rules. Photos retain their natural colors.
- Dark green opening and collection, cream editorial/contact sections, and deep green navigation/footer. The oversized footer wordmark stays removed.
- Desktop with sufficient height: one 180svh opening with a sticky 100svh stage. Native scroll advances three synchronized photo/copy chapters with a 4.5% photo movement. Chapter buttons also select a chapter directly.
- Phones, short windows, reduced motion and a saved Motion off preference use a static introduction with manually selectable chapters. Motion state persists; pausing/resuming preserves the reading position in the collection. No timer, autoplay, wheel interception or idle animation loop.
- The photographic O bridges the last two chapters within the compact hero, behind the shade and copy. It reuses the decoded third-chapter image and is suppressed if that source is unavailable, motion is off, or the viewport is static/mobile.
- The collection keeps two-column comparison, neighborhood filters and the optional gallery with gentle perspective. Detail pages retain clear title/rental facts and the complete, unobscured photo gallery.

## Boundaries

Public refinements are scoped under `body.rental-site` in `brand.css`. Mint Mojo retains its separate design and motion. No production dependencies or new font requests.

Property records, source photographs, gallery ownership/order, public destinations, the CMS, admin and deployment configuration are preserved. Empty or failed CMS responses remain authoritative. Failed photographs have explicit fallback messages.

## Review

See [the three-version visual comparison](docs/redesign/comparison/README.md) for validation and visual limitations. This follow-up is on a separate review branch and PR. The production approval boundary in `PRODUCT.md` remains in force.
