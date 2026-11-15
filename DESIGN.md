# Oaktown public website design

## Direction

The Oaktown green identity on white and warm cream surfaces, inspired by Mint Mojo, with a cinematic photo opening and a carefully spaced rental catalogue. Full property photography, expressive Manrope headings and quiet rules provide the visual character; rent, addresses and contact actions remain easy to scan. Dark forest green is reserved for primary actions rather than large section backgrounds.

This direction follows the owner's request to lighten the main website while retaining the earlier motion and green brand identity.

## System

- Light surfaces: white `#fffefb`, warm cream `#f3f3e8`, pale photo fallback `#e1e9dd`. Text: forest `#123b25`, secondary `#4b6255`; accent green `#10783d`. Buttons use deep forest `#0b2c1a` with white text and green hover. The supplied logo remains unchanged. The final scoped palette in `brand.css` adapts the legacy foreground tokens for this light presentation.
- Existing self-hosted Manrope for display headings, DM Sans for body and controls, and the original italic serif phrases in all three hero chapters. Responsive headings and full addresses can wrap.
- Maximum content width 1280px, 22–24px phone/tablet gutters, deliberate section spacing, restrained photo zoom and thin dividing rules. Photos retain their natural colors.
- White navigation, collection, FAQ, contact and property details; warm cream editorial, community, vacation feature and footer. The photo opening uses a light wash with green text, stronger beneath copy on phones. Apply, availability and showing actions use solid dark green; the mobile action bar is light. The oversized footer wordmark stays removed.
- With motion enabled and at least 560px of window height: one 180svh opening with a sticky photo stage on phones, tablets and desktops. Native scroll advances three synchronized photo/copy chapters with continuous zoom/pan (scale 1.12 to 1.04; vertical drift 1.2% to -1.2%). Phone stages leave room for the fixed actions. Chapter buttons also select a chapter directly.
- Very short windows (under 560px high), reduced motion and a saved Motion off preference use a static introduction with manually selectable chapters. Motion state persists; pausing/resuming preserves the reading position in the collection. No timer, autoplay, wheel interception or idle animation loop.
- The photographic O bridges the last two chapters within the compact hero, behind the shade and copy. It reuses the decoded third-chapter image and is suppressed if that source is unavailable, motion is off, or the viewport is static/mobile.
- The collection keeps two-column comparison, neighborhood filters and the optional gallery with gentle perspective on desktop and phone gallery layouts. Detail pages retain clear title/rental facts and the complete, unobscured photo gallery.

## Boundaries

Public refinements are scoped under `body.rental-site` in `brand.css`. Mint Mojo retains its separate design and motion. No production dependencies or new font requests.

Property records, source photographs, gallery ownership/order, public destinations, the CMS, admin and deployment configuration are preserved. Empty or failed CMS responses remain authoritative. Failed photographs have explicit fallback messages.

## Review

See [the three-version visual comparison](docs/redesign/comparison/README.md) for validation and visual limitations. This follow-up is on a separate review branch and PR. The production approval boundary in `PRODUCT.md` remains in force.
