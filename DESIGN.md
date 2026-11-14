# Oaktown public website design

## Direction

A Louisville property catalogue: warm paper, forest green and generous, accurately labelled photographs. The first task is to find a home and understand its rental details. Premium means clarity, proportion and reliable behavior, not a luxury claim about the properties.

## System

- Paper `#f8f7f2`, quiet alternate surface `#efeee6`, forest `#183d2e`, deep forest `#102b21`, body `#243c30`, secondary text `#536558`, borders `#cbd1c7`.
- Georgia for complete editorial headings; existing self-hosted DM Sans for controls, body and property names. No isolated italic words, display gradients or imported font requests.
- Maximum content width 1280px; 20–24px phone/tablet gutters. Headings use a modest 39–88px range; paragraphs generally 16–17px. Full address text can wrap.
- Flat photographs, thin separating rules, 2px control corners, no ornamental cards or shadows. Oaktown's original JPG remains unchanged.
- One primary button style. Neighborhood filters and layout switches expose selected state. Contact and application destinations remain the existing ones.
- Manual hero photography. No automatic rotation, pinned hero, parallax or scroll-driven scene transitions. Photo hover and crossfade are short; existing reduced-motion and saved motion preference remain respected.
- Desktop: introduction alongside one property photograph, followed immediately by a two-column collection. Mobile: introduction, photograph, one-column listings. Rental detail pages use a readable title/facts area and a full-image gallery with keyboard-operable lightbox.

## Boundaries

Public changes are scoped under `body.rental-site` in the already-shipped `brand.css`, preserving Mint Mojo's separate design. The existing base styles remain for its compatibility; static style detectors may report overridden legacy declarations. No new production dependencies, assets routing changes or deployment settings.

Photographs come from the same property's current records. Never substitute another property to fill a broken image. Failed-image states use neutral surfaces and an explicit message. Empty or failed CMS responses never resurrect fallback inventory.

## Review status

This is a review branch, not an approved production release. See `docs/redesign/README.md` for tests, screenshots, reference evaluation and outstanding network-dependent checks. Real-photo composition is not signed off while the property CDN is inaccessible.
