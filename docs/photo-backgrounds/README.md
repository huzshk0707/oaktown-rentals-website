# Lighter opening photographs and a full-section Louisville background

The owner requested a modest reduction in the white tint over the three opening photographs, plus the Louisville city image filling Rooted in Louisville behind its text.

## Changes

- Desktop opening tint decreases from roughly 95% to 85% at the left edge, 86% to 75% at the 22% stop, and 55% to 40% at the 46% stop. The right side and existing chapter/scroll behavior are preserved. Phone copy tint is reduced similarly, while the clear upper photo band remains. Hero description text uses primary forest green to retain contrast.
- The existing city photograph fills the entire editorial section rather than a separate panel. Copy sits over a cream gradient on the left; the right-hand skyline retains its natural color. Phone layouts use a visible upper photo band, a vertical tint beneath the copy and responsive cover positioning near the main towers.
- The same image asset, alt text, source and CC BY-SA credit remain. The credit has its own light backing above the photo/tint. The asset file is unchanged; only responsive CSS display cropping and overlays change.
- The original logo, desktop card slideshow, static mobile cards, property facts, galleries, admin/CMS, authentication and deployment configuration are preserved.

## Comparison

Before is `683caed`, the merged desktop slideshow version. Both versions use identical published content and original photo bytes, mirrored into the local browser after TLS-verified downloads. No property data or source images were edited.

| View | Before | After |
| --- | --- | --- |
| Desktop opening | [Before](before-desktop-hero-1.png) | [Photo 1](after-desktop-hero-1.png), [photo 2](after-desktop-hero-2.png), [photo 3](after-desktop-hero-3.png) |
| Phone opening | [Before](before-phone-hero-1.png) | [Photo 1](after-phone-hero-1.png), [photo 2](after-phone-hero-2.png), [photo 3](after-phone-hero-3.png) |
| Spanish small-phone opening | [Before](before-phone-es-hero-1.png) | [Photo 1](after-phone-es-hero-1.png), [photo 2](after-phone-es-hero-2.png), [photo 3](after-phone-es-hero-3.png) |
| Desktop Louisville section | [Before](before-desktop-about.png) | [Full photograph behind copy](after-desktop-about.png) |
| Phone Louisville section | [Before](before-phone-about.png) | [Upper view](after-phone-about.png), [copy and credit](after-phone-about-lower.png) |
| Spanish Louisville section | [Before](before-phone-es-about.png) | [Upper view](after-phone-es-about.png), [copy and credit](after-phone-es-about-lower.png) |

## Verification

- 48 public browser, 35 responsive design, 15 browsing-state audit and 24 desktop-slideshow/gallery checks passed.
- Syntax, diff checks and 3 CMS/security tests passed. No production write tests were performed.
- Twelve settled axe scans cover all three opening chapters and the city section at 1440 × 1000 English, 390 × 844 English and 320 × 640 Spanish sizes. Zero confirmed WCAG A/AA violations were reported. Image-backed contrast checks remain incomplete and were visually reviewed; this is not a claim of complete accessibility conformance. See [results](accessibility.json).
- Each city-section capture also asserts exactly one photograph, full-section image coverage and no horizontal document overflow. Visual review checked the skyline focal point, readable text, mobile/Spanish wrapping, original logo and the foreground credit.

Native Safari/Firefox devices and uncached performance benchmarks remain unverified. The existing motion preferences, gallery routing and card-hover behavior are retained; this change adds no animation or runtime dependency.
