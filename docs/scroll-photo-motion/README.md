# Visible scroll-driven photo motion

The first-visit entrance in PR #11 did not address the owner's missing scroll animation. The existing scroll sequence required a window at least 851px wide **and** 700px tall; phone-sized views and many short laptop windows received only manual photo selection. The original photo movement was also subtle.

## Fix

- Phones, tablets and laptops with at least 560px of available height now pin the existing hero and advance its three image/copy chapters with normal scrolling.
- Each photo continuously pans and zooms while its chapter is being scrolled: scale 1.12 → 1.04 and vertical drift 1.2% → -1.2%. The image sequence and headings advance together, including when scrolling backward.
- The opening stays at 180svh, keeping homes within two screens. View Homes remains available as a direct route into the collection.
- The scroll hint is visible on phones. Additional short-window type/layout rules keep the hint, headings, actions and chapter controls clear in EN/ES.
- Gallery mode also receives a lighter perspective effect on phones, driven by its existing native horizontal scrolling. Grid remains the default comparison view.
- Motion off and reduced motion retain static photos and manual chapter buttons. Very short landscape windows remain unpinned. The photographic O stays limited to wider layouts.
- The approved palette, content, original photos, public routes, galleries and application/showing links remain in place. No animation library, new image source or wheel/scroll interception was added.

## Verification

73 focused scroll-photo checks cover EN/ES at 320×560, 320×640, 390×640, 390×844, 768×1024, 1024×650 and 1440×900; chapter/photo synchronization; continuously changing transforms within one chapter; pinned geometry; visible controls; scroll-hint clearance; static preferences; phone gallery perspective; and short-landscape fallback.

Existing public, design, motion, opening, cinematic, CMS/security and Mint Mojo regressions also pass. The public scroll assertion now waits for the expected rendered chapter rather than assuming an exact 100ms scheduling delay.

## Local visual evidence and limits

These nine screenshots are actual phone/laptop browser captures with the property-photo CDN blocked in this running environment. They verify the chapter, hint and layout states, **not final real-photo appearance**. The source photos and their URLs are unchanged. Real-photo captures of the underlying approved design remain in the PR #11 history; they are not fresh captures of this fix.

| State | Phone, 390×844 | Spanish short phone, 320×560 | Short laptop, 1024×650 |
| --- | --- | --- | --- |
| Chapter 1 | [Capture](phone-chapter-1-fallback.png) | [Capture](short-phone-chapter-1-fallback.png) | [Capture](laptop-chapter-1-fallback.png) |
| Chapter 2 | [Capture](phone-chapter-2-fallback.png) | [Capture](short-phone-chapter-2-fallback.png) | [Capture](laptop-chapter-2-fallback.png) |
| Chapter 3 | [Capture](phone-chapter-3-fallback.png) | [Capture](short-phone-chapter-3-fallback.png) | [Capture](laptop-chapter-3-fallback.png) |

[Observed transform/chapter states](captures.json).

To reproduce the focused suite, serve this checkout on 8793, then run:

```sh
OAKTOWN_BASE_URL=http://127.0.0.1:8793 npm --prefix tests run test:scroll-photos
```

The owner explicitly approved adding the scroll-photo feature and merging it after checks. Merge/deployment status is tracked by the associated PR; no production database, private admin, auth, storage, original assets, Mint Mojo design or Cloudflare/publication configuration is changed.
