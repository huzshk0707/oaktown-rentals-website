# Public website polish

This pass refines the light Oaktown website at `798ab24` after the owner's copy/design review and explicit instruction to implement and merge. It preserves the existing public architecture, property records, photo ownership and motion rather than applying an older redesign branch.

## Result

- **Direct English/Spanish copy.** FAQs speak as Oaktown, with practical application/showing guidance. The migration reference and unverified 48–96-hour turnaround are removed. The repeated collection disclaimer, preview footer wording and migration link are removed from public presentation. Application guidance still directs visitors to the team about availability and application, pet or other charges.
- **Clear availability actions.** Records with unknown availability have one Check availability / Consultar disponibilidad link. Published available, coming-soon and rented statuses still receive labels. No availability dates or other property values were invented or edited.
- **A quieter header and opening.** A forest-green typographic wordmark uses the existing serif/body system; the supplied original logo remains in the footer. The header stays fixed so its position is consistent while browsing. One primary View homes action follows the hero copy. Desktop tint is concentrated behind the left-hand text, and phones retain a clear photographic upper band. The three photo chapters, centered photographic O, reduced motion, Motion off and bottom Text/Apply actions remain.
- **More useful property cards.** Up to three translated features come directly from each home's existing feature list, excluding repeated bedroom/bathroom/location lines. Rent and deposit remain visible; phone rental facts align to the left. No floor area or pet-permission badges are added without source values. The Highlands filter names Cherokee Triangle explicitly while retaining its existing behavior and saved-state key.
- **Consistent hierarchy.** The collection count reads 4 homes rather than resembling a section number. Section labels run 01–05 from homes through contact; chapter numbers remain in the photo controls. Mint Mojo is a compact, separate sister vacation property link after Louisville contact information.
- **A listing contrast fix.** The legacy `.page-intro.has-image` selector had kept a dark background behind the light theme's green listing titles. The light theme now overrides that exact selector. Browser regressions verify at least 3:1 contrast for the address and 4.5:1 for its summary.

Working contact details remain intact. Branded email, reviews/testimonials, floor areas, pet policies and precise availability can be added when their factual source material is available. No reviews, mailboxes or rental policies were fabricated.

## Visual comparison

Before is commit `798ab24` (merged PR #15). Both versions use the same read-only snapshot of four published properties and the same original photo bytes. Self-hosted fonts and reveal animations are settled before captures.

| View | Before | After |
| --- | --- | --- |
| Desktop opening | [Before](before-desktop-hero.png) | [After](after-desktop-hero.png) |
| Phone opening | [Before](before-phone-hero.png) | [After](after-phone-hero.png) |
| Spanish small-phone opening | [Before](before-phone-es-hero.png) | [After](after-phone-es-hero.png) |
| Desktop collection | [Before](before-desktop-collection.png) | [After](after-desktop-collection.png) |
| Phone collection | [Before](before-phone-collection.png) | [After](after-phone-collection.png) |
| Desktop property card | [Before](before-desktop-card.png) | [After](after-desktop-card.png) |
| Phone property card | [Before](before-phone-card.png) | [After](after-phone-card.png) |
| Spanish property card | [Before](before-phone-es-card.png) | [After](after-phone-es-card.png) |
| Desktop sister property | [Before](before-desktop-vacation.png) | [After](after-desktop-vacation.png) |
| Spanish sister property | [Before](before-phone-es-vacation.png) | [After](after-phone-es-vacation.png) |

Final FAQ copy: [desktop](after-desktop-faq.png), [phone](after-phone-faq.png), [Spanish small phone](after-phone-es-faq.png). Listing headers: [desktop](after-desktop-listing-header.png), [phone](after-phone-listing-header.png), [Spanish small phone](after-phone-es-listing-header.png). Rental facts/application guidance: [desktop](after-desktop-listing.png), [phone](after-phone-listing.png), [Spanish small phone](after-phone-es-listing.png).

Removing the repeated note brings the first card forward from 1987px to 1934px on the measured 1440 × 1000 desktop, from 1598px to 1557px on the 390 × 844 phone, and from 1376px to 1364px on the 320 × 640 Spanish phone. The hero duration remains unchanged. See [viewport-specific measurements](metrics.json); these are document positions in CSS pixels, excluding reveal transforms, rather than universal performance claims.

Original CDN bytes were downloaded with TLS verification and mirrored into the local browser because its proxy trust differs from the HTTP client. No source images were edited, replaced or reassigned. Captures do not measure uncached network performance.

## Validation and review

- **48 public browser checks**, including two new contrast regressions for listing headings and summaries.
- **35 responsive design**, **73 scroll-photo**, **15 browsing-state audit**, **20 immersive browsing** and **19 opening-motion** checks. The audit verifies that amenity labels belong to the same home in the selected language and that unknown availability does not assert availability.
- **3 CMS/security tests**, the disposable admin browser workflow, syntax and diff checks. Write tests use a local disposable database, with no production writes.
- **Nine settled real-photo axe scans** covering home, collection and listing views at desktop, phone and Spanish small-phone widths: zero confirmed WCAG A/AA violations after correcting the listing-header background. Remaining image-backed/overlap contrast checks are recorded as incomplete for manual review; these are not counted as passes. See [full results](accessibility.json).
- Visual review covered all three hero photographs at desktop and phone sizes, the compact promotion, card facts and Spanish copy. Keyboard navigation, gallery focus, filtering, Back/Forward/reload state, phone actions and reduced-motion paths retain automated coverage.
- Impeccable's polish/craft guidance and Vercel Web Interface Guidelines informed the review. The Impeccable launcher was inspected and its checksum-verified engine used for context and one static detector pass. Static contrast warnings from legacy theme rules were assessed against computed rendering and axe; the image-backed O is an intentional owner-requested effect. A redundant footer kicker was removed. No third-party code generator, hook or production dependency was installed into the website.

Native Safari/Firefox device tests and uncached performance benchmarks remain unverified. Automated scans do not establish complete accessibility conformance.

## Reproduce the comparison

Serve `798ab24` separately as the before version and the working tree as the after version, then run:

```sh
OAKTOWN_BASE_URL=http://127.0.0.1:8860 npm --prefix tests run test:browser
OAKTOWN_BASE_URL=http://127.0.0.1:8860 npm --prefix tests run test:audit
OAKTOWN_BASE_URL=http://127.0.0.1:8860 \
OAKTOWN_BEFORE_URL=http://127.0.0.1:8861 \
OAKTOWN_PHOTO_MANIFEST=/path/to/source-photo-manifest.json \
OAKTOWN_CONTENT_SNAPSHOT=/path/to/public-properties-snapshot.json \
OAKTOWN_AXE_PATH=/path/to/axe.min.js \
npm --prefix tests run capture:polish
```

The manifest maps original source URLs to a local `path` and `contentType`. The script only reads public content and writes review artifacts. CMS/admin code, authentication, secrets, migrations, deployment configuration, original media and production property records are unchanged. Public application, showing and property routes remain intact; noindex/nofollow remains in place.
