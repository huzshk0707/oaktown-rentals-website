# Desktop property-card slideshow

Hovering anywhere on a desktop property card now cycles all of that home's photographs in their existing order. Leaving restores the original main photograph immediately, even if the link retains keyboard focus. The Preview photo button is removed.

Phones, touch input and windows at or below 850px retain the main card photo. A tap opens the normal listing at its first photograph, with the complete gallery available. Keyboard focus alone, Motion off and system reduced motion also keep cards static.

[Watch the real-photo recording](demo.mp4)

## Behavior

- Playback starts after a 650ms hover-intent delay. Each decoded photograph holds for 1.5 seconds with a gentle 300ms fade, then the sequence loops through the main photograph.
- Images load one at a time from the hovered property's own gallery. The main image is never replaced or mutated. Only the current/fading overlay layers are retained, and there is no slideshow timer outside an active hover.
- Moving between cards resets the previous card. Leaving cancels pending loads; stale decoding cannot resurrect the sequence. Failed or slow images are skipped while retaining a usable frame. A five-second load deadline prevents a stalled download from blocking the sequence indefinitely.
- Routing, filters, layout/language changes, pointer capability, motion settings, page visibility and window blur stop playback. Clicking during a slideshow freezes the displayed frame and carries it into the existing shared-photo transition and gallery.

The original logo, Louisville city photograph, public rental details, application/showing links, unit-photo ownership/order, CMS/admin implementation, authentication and deployment configuration are preserved.

## Captures and verification

| State | Capture |
| --- | --- |
| Desktop main photograph | [Before hovering](desktop-main.png) |
| Desktop additional photographs | [Photo 2](desktop-photo-2.png), [photo 3](desktop-photo-3.png), [photo 4](desktop-photo-4.png) |
| Pointer leaves | [Main photo restored](desktop-leave-main.png) |
| Phone card | [Static main photograph](mobile-main.png) |
| Phone opens listing | [First photograph and complete gallery](mobile-listing.png) |

These captures use a read-only snapshot of four published properties and the original source photo bytes mirrored locally after TLS-verified downloads. No source photographs or property records were edited. The recording demonstrates normal-speed playback and pointer-leave restoration; it is not an uncached network benchmark.

- **24 browsing checks passed**, including a complete 14-photo loop and source ownership, card-text hover, pointer-leave restoration with retained focus, no focus autoplay, same-photo navigation, failed-photo recovery, delayed decoding after leave, filtering/Motion-off cancellation, touch static cards and first-photo/full-gallery opening. Existing shared-transition, cancellation, cover/gallery and rental-dock checks remain covered.
- **48 public browser**, **35 responsive design** and **15 browsing-state audit** checks passed. The **3 CMS/security tests**, disposable admin browser workflow, syntax and diff checks also passed.
- Independent source review found no material issues with timer cleanup, stale decoding, crossing cards, selected-photo navigation, page/media changes or failure handling.
- Full-loop timing tests use Playwright's virtual clock and image fixtures. The captures separately verify real source photographs and ordinary playback speed. Native Safari/Firefox devices and uncached performance benchmarks are not claimed.

```sh
OAKTOWN_BASE_URL=http://127.0.0.1:8880 npm --prefix tests run test:browsing
```

The existing `capture:browsing` helper follows the new hover/static-mobile interaction and supports `OAKTOWN_BROWSING_OUT_DIR` to preserve older review captures.
