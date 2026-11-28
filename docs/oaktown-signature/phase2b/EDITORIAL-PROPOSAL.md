# Editorial card treatment — proposal for approval

**Review-only prototype. The deployed card styling remains Ravi's Phase 2A styling.** This proposal is rendered in a temporary browser session with the real hosted page and original photographs. The CSS and DOM changes exist only during capture, and all prototype files are excluded from Cloudflare static deployment.

[Side-by-side comparison](editorial-comparison.jpg) · [Desktop left](proposal-desktop-left.png) · [Desktop right](proposal-desktop-right.png) · [Mobile](proposal-mobile-left.png) · [Spanish mobile](proposal-mobile-es-left.png) · [320px Spanish](proposal-narrow-es-left.png).

## Precise proposed changes

| Element | Current provisional treatment | Review proposal |
| --- | --- | --- |
| Card surface | Slightly green ivory, small radius and very light border | Exact warm ivory `#FAF7EF`, limestone `#ECE8DD` border, forest `#102F23` text; champagne `#D4C4A4` detail accents |
| Property name | 17px desktop serif under a large photograph | Approximately 32px desktop / 27px phone serif, more editorial hierarchy and readable address/unit |
| Monthly rent | 18px serif stacked beneath title | 25px clean sans-serif, aligned right on desktop; 24px below the title on mobile, with visible monthly unit |
| Supporting facts | 9–10px deposit/specification lines | 11–13px supporting type, restrained neighborhood label and more breathing room |
| Bedrooms/bathrooms | Slash-separated text | Consistent 19px outline icons with text retained; decorative icons hidden from assistive technologies |
| Card action | Small “Check availability” link below specifications | 44px-tall “View home” action on the facts row, with a champagne underline and a restrained arrow. Existing availability/showing access remains in the detail page and collection guidance. This action change is part of the approval request. |
| Image furniture | Small photo count and separate corner arrow | Slightly larger readable photo count; remove redundant image arrow while retaining the full image/detail link |
| Hover | Existing gallery depth and image effects | Gentle border/shadow emphasis plus a maximum 1.025 image zoom, only for fine-hover motion-enabled sessions |

No proposed change to the fixed card widths, original photo URLs/order, aspect ratios, gallery movement, filter rules, hero, introduction, property facts or other homepage sections. Unknown availability stays unlabelled. Madison's existing `coming_soon` status remains inherited from the file catalogue; this review does not reconfirm its current availability or add “Ready Now.” No sample price or specification is introduced.

Phone cards keep generous photographs and stack price beneath the address to avoid cramped columns. The 320px Spanish treatment wraps its action below the facts when necessary. Motion-off/reduced-motion support is preserved. The prototype uses actual property values and no placeholders.

## Reversible implementation boundary

`editorial-prototype.css` is scoped under `#homes[data-editorial-review]`. `tests/capture-editorial-review.cjs` adds that attribute, injects the stylesheet and demonstrates the icon/detail-action markup only in its browser page. Reloading the preview discards the proposal. No public route, query flag, CMS field or runtime asset was changed.

If approved, the next bounded implementation would apply this treatment to the reusable `property-cards.js` renderer and collection-scoped styling, keeping the gallery's geometry/interaction contract, followed by focused bilingual/accessibility/collection checks. Do not perform that step until the owner and ChatGPT approve the detailed treatment.

## Pending visual decisions

Review the desktop/mobile treatment, the action change and the genuine-source photo crop/quality limits documented in [PHOTOGRAPHY.md](PHOTOGRAPHY.md). Higher-resolution originals would improve Smallboat and Cherokee at the approved large size. Obtaining or migrating new originals is a separate follow-up, not part of this prototype.
