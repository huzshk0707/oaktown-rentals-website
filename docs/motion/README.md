# Refined photo motion

An extension of the catalogue design merged in PR #8. The owner selected **Photo transitions and subtle depth**. This branch adds motion to the existing layout and real photography; it does not restore the earlier theme.

[Watch the motion preview](preview.mp4) · [Desktop](desktop.png) · [Mobile](mobile.png)

## Motion direction

The focal interaction is moving between photographs of the featured home. Selecting a photo creates a short directional wipe and a small change in scale, making the relationship between rooms clear. It runs only after a visitor chooses a photo; there is no automatic slideshow.

Supporting depth stays within the photographs. On desktop fine pointers, the featured image tilts by at most 0.8° horizontally and 1.2° vertically. Leaving the image returns it to rest. Gallery view uses at most 3° of perspective; property text, rental facts and inquiry links remain flat. The two Our story photographs reveal once when their section comes into view. No text waits for an entrance animation.

The introduction retains its current height, and the homes remain immediately accessible. The comparison grid stays flat. Phones and coarse pointers receive the photo transition without pointer depth.

## Controls and implementation

- Existing Motion Off and operating-system reduced motion cancel active animations, preserve the selected photo and disable spatial effects. The saved preference still survives reloads.
- Rapid photo selections interrupt cleanly. Language changes and routing dispose of listeners, observers, queued frames and active animations.
- Native CSS and Web Animations API; no added runtime dependencies, canvas sequences, media assets or scroll interception.
- Effects last 420–790ms. Pointer and gallery updates share a requestAnimationFrame only when input/size changes; there is no idle render loop. Geometry reads are batched before writes.
- Photographs and property data are unchanged. The clip reveal and transforms affect presentation only.

## Validation

- Existing public browser suite: **44 checks passed**, including all six layout widths, EN/ES, gallery/focus, inquiries, filters and reduced motion.
- Existing design suite: **35 checks passed**.
- Motion suite: **11 checks passed** for selected-photo feedback, interruption, bounded desktop depth, stable copy, pointer reset, gallery/grid geometry, motion-off persistence, system reduced motion, language cleanup and touch behavior.
- Root/browser syntax checks and diff check passed.
- Three real-photo axe scans (desktop English, phone English, 320px Spanish) found no confirmed WCAG A/AA violations; see `accessibility.json`.

The video records the actual local browser at 1280 × 800 with the current published photographs. Source bytes were downloaded through the environment’s TLS-verified HTTP client and mirrored to the browser because its proxy CA is not trusted. These captures verify motion and appearance, not live CDN or native-device performance. The motion test uses explicitly synthetic imagery isolated to its browser fixture; it changes no property records.

Only public styling/effects, frontend tests and review documents changed. Admin, CMS, property data, APIs, authentication, migrations, media and deployment configuration are untouched. This review branch must be approved before merging or production deployment.

```sh
OAKTOWN_BASE_URL=http://127.0.0.1:8801 npm --prefix tests run test:motion
```
