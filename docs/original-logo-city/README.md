# Original identity and Louisville photograph

The owner asked to restore the original logo, choose a suitable header treatment, replace the two photographs in Rooted in Louisville with one authentic city view, and merge the completed change.

- The header again serves the exact original `assets/oaktown-rentals-logo.jpg`, matching the footer. The substitute typographic wordmark and its CSS are removed. The warm-white header preserves the supplied green artwork and existing navigation contrast.
- Rooted in Louisville contains one aerial photograph of the actual downtown skyline and Ohio River, by King of Hearts. It displays its complete 16:9 composition with no crops, tint or retouching, replacing both rental-property photographs in that section.
- The 1920 × 1080 image is served locally, is about 411 KB, has explicit dimensions and loads lazily. A compact English/Spanish caption provides source/photographer and CC BY-SA 4.0 links. See [source and license details](../../assets/louisville/README.md).
- Product/design guidance now explicitly requires the original supplied logo in both header and footer unless the owner asks for a replacement.

The latest admin photo-ordering work on `46d0397` is retained. Property records, unit galleries, pricing, availability, admin/CMS implementation, authentication and deployment configuration are unchanged.

## Review captures

| View | Header | About section | Full city photograph on phone |
| --- | --- | --- | --- |
| Desktop 1440 × 1000 | [Original logo](desktop-header.png) | [City photograph and copy](desktop-about.png) | — |
| Phone 390 × 844 | [Original logo](phone-header.png) | [Responsive section](phone-about.png) | [Photograph/caption](phone-city.png) |
| Spanish phone 320 × 640 | [Original logo](phone-es-header.png) | [Translated section](phone-es-about.png) | [Photograph/caption](phone-es-city.png) |

Captures load the actual local city image and original logo. External property photos are blocked for these isolated header/about checks; no fixture replaces the city photograph. Initial hash scrolling, fonts, image decoding and reveal transitions settle before capture.

## Verification

- 48 existing public browser checks, 35 responsive design checks and 15 browsing-state audit checks passed.
- Syntax checks, 3 CMS/security tests and `git diff --check` passed.
- Three settled axe scans covering the header and about section at the captured sizes reported zero confirmed WCAG A/AA violations; see [results](accessibility.json). Each view verified exactly one about photograph, the original header logo matching the footer, correct photo decoding and no horizontal document overflow.
- Independent visual review verified the original JPEG, undistorted 16:9 composition, source/license attribution and normal Our story navigation on desktop and phone. An initial screenshot timing race was corrected in the capture process; no user-path navigation defect was reproduced.

Native Safari/Firefox device testing and uncached performance benchmarking are not claimed.
