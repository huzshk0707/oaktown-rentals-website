# More immersive property browsing

This page records the original PR #13 behavior and captures. The subsequent [desktop slideshow update](../desktop-slideshow/README.md) replaces the single-photo preview/toggle: desktop hover cycles every photo, leaving restores the main image, and mobile cards stay static. The capture helper now follows that current interaction and accepts `OAKTOWN_BROWSING_OUT_DIR` for a separate output folder.

This extends `main` at `9690315`, preserving the cinematic entrance, green/cream identity and scroll-photo chapters already merged through PR #12. It does not apply the older PR #10 theme/motion branch.

The supplied reference clip shows camera movement through a 3D interior. This change borrows its visual continuity using Oaktown’s real photographs. It does not represent a navigable 3D or 360° tour; that would require a suitable capture or model of each property.

[Watch the recorded preview](preview.mp4)

## What changed

- **Preview another view before opening a listing.** A card can show an additional photo from the same property, loaded on demand. Hover and keyboard focus offer a quick preview; an explicit pressed-state toggle works on phones and can keep the selection visible. Failed preview downloads keep the main photo and expose a retryable message. The interface says “Preview photo” because a source image is not always an interior.
- **Carry the chosen photo into the listing.** A native shared-image transition connects the card to the new listing cover. The same image is selected in its full gallery, maintaining continuity and photo-to-property accuracy. The address and rental facts remain readable. Motion Off, system reduced motion and unsupported browsers use immediate navigation.
- **Keep facts and actions accessible.** A compact rental bar appears after the full fact block passes behind the header. Desktop provides showing/application links; phone layouts retain the existing bottom actions and use the top bar for rent and basic facts. It disappears at the title/contact section or in windows shorter than 480px. A focused action is retained until focus leaves.
- **Enlarge the photo being displayed.** The cover tracks gallery selection. Clicking its enlargement control opens that same image and Escape restores focus.

The layout remains a buildless public frontend. No dependencies, original media, property records, pricing, availability, APIs, admin workflows, auth, migrations, secrets or deployment configuration changed.

## Screenshots

| View | Capture |
| --- | --- |
| Desktop collection | [Main photographs](desktop-cards.png) |
| Desktop card preview | [Additional photograph](desktop-preview.png) |
| Desktop listing | [Selected photograph carried into cover](desktop-listing.png) |
| Desktop rental bar | [Persistent facts/actions](desktop-rental-dock.png) |
| Phone listing | [390px English](listing-390-en.png) |
| Phone rental bar | [320px Spanish](dock-320-es.png) |
| Tablet listing | [768px](listing-768-en.png) |

These use a read-only public API snapshot of four published properties and the original CDN photographs. The same source bytes are mirrored into the local browser through Playwright because its proxy trust differs from the HTTP client; TLS verification was not disabled. Captures establish visual behavior, not uncached network performance. The reference video itself is not shipped or copied into the website.

## Validation

- **20 new browsing checks:** on-demand loading, same-property photo ownership, hover/keyboard/touch toggles, failure recovery, native transition completion/cleanup, modified links, browser Back, unsupported/motion-off/reduced-motion fallbacks, cover/gallery consistency and rental-bar clearance at 320/390/768/1440px.
- A delayed native-transition regression verifies that an obsolete callback cannot replace a newer listing’s cover or gallery with a previous home’s photo.
- Existing suites passed: **46 public browser**, **35 design**, **31 motion**, **18 cinematic**, **19 opening** and **73 scroll-photo** checks. The **3 CMS/security tests**, disposable admin browser workflow, syntax and diff checks also passed.
- Four settled real-photo listing scans (desktop, tablet, English phone and Spanish 320px phone) recorded **zero confirmed WCAG A/AA violations**. Two image-backed gallery contrast nodes per view remain flagged for manual review; their solid controls were visually checked. See [accessibility results](accessibility.json).
- Independent review reproduced and verified fixes for stale transition callbacks and cover/enlargement consistency. No unresolved material findings remained.

No native Safari/Firefox device tests or LCP/CLS benchmark are claimed. The feature-detection fallback was tested in Chromium with the transition API unavailable. The owner subsequently approved the audit follow-up and merge in chat. See [the follow-up review](../audit-fixes/README.md) for the final layout, history-restoration and rental-clarity changes; the captures on this page show the earlier browsing implementation.

```sh
OAKTOWN_BASE_URL=http://127.0.0.1:8810 npm --prefix tests run test:browsing
```

`capture:browsing` accepts `OAKTOWN_CONTENT_SNAPSHOT`, `OAKTOWN_PHOTO_MANIFEST` (source URL → local `path`/`contentType`) and `OAKTOWN_AXE_PATH` for reproducible local captures. It only reads the public site/snapshot and writes review artifacts.
