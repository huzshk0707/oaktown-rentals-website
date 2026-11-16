# Admin editing review evidence

Captured with Chromium at 1440 × 1000 and 390 × 844 using the disposable SQLite/R2 test harness. The before interface is from `origin/main` at `152691e`; the after interface is the admin improvement branch. These are local fixtures, not an authenticated production sign-in or production publication.

Photographs are the exact existing property URLs, fulfilled from the previously downloaded image cache. No replacement photographs or cross-unit substitutions were used. The fixture changes Colonial's saved draft rent to $1,999 while its published rent stays $1,799, so the difference between the two versions is visible. This change exists only in the disposable local database.

| Screen | Before | After |
| --- | --- | --- |
| Desktop collection | [Before](before-desktop-dashboard.png) | [After](after-desktop-dashboard.png) |
| Mobile collection | [Before](before-mobile-dashboard.png) | [After](after-mobile-dashboard.png) |
| Desktop draft/live comparison | [Before](before-desktop-draft-comparison.png) | [After](after-desktop-draft-comparison.png) |
| Mobile draft/live comparison | [Before](before-mobile-draft-comparison.png) | [After](after-mobile-draft-comparison.png) |
| Desktop details | [Before](before-desktop-details.png) | [After](after-desktop-details.png) |
| Mobile details | [Before](before-mobile-details.png) | [After](after-mobile-details.png) |
| Desktop photos | [Before](before-desktop-photos.png) | [After](after-desktop-photos.png) |
| Mobile photos | [Before](before-mobile-photos.png) | [After](after-mobile-photos.png) |

Additional after views: [desktop website preview](after-desktop-preview.png), [mobile website preview](after-mobile-preview.png), [desktop publishing review](after-desktop-review.png), and [mobile publishing review](after-mobile-review.png).

## Accessibility review

Ten automated axe WCAG A/AA scans across the after dashboard, details, photos, private-preview dialog and review section at both viewport sizes reported no confirmed violations. [Raw findings](accessibility.json) retain incomplete checks, including contrast that requires manual inspection where sticky controls overlap content or imagery is present. No page-level horizontal overflow was detected at the two captured sizes. Visual inspection checked readable field labels, the persistent Save/Preview/Publish controls, photo ordering controls, and the separation of live facts from draft changes.

Automated scans do not establish full accessibility conformance or replace screen-reader, native Safari/Firefox, production Access sign-in and phone-keyboard acceptance testing.
