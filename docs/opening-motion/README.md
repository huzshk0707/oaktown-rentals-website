# Curated opening motion — review

This adds a brief entrance to the approved cinematic homepage. The settled layout, typography, original green/sage/cream palette, View Homes action, compact scroll chapters, photographic O and rental catalogue remain the approved design.

## Reference selection

The four videos and screenshot in the owner's [Oaktown website Drive folder](https://drive.google.com/drive/folders/1dRBTVmYxRb4n16qSWc0O4E-2CugKYzB7) were reviewed through decoded timeline frames. Source recordings remain in Drive; their footage, third-party photographs, interface artwork and music are not embedded in the website.

| Reference | Visual finding | What carries into Oaktown |
| --- | --- | --- |
| [Pheme Growth](https://drive.google.com/file/d/18byP1EKjNd3mtIZGk8Y3XPi2PFrMLuSW/view), 20.38 s | Strong photographic stages, large sans/italic type, carefully paced transitions and a later photo-filled word. | Main direction: a quiet photographic arrival and staggered type, joining Oaktown's existing chapters and O. |
| [Web Love / FIND](https://drive.google.com/file/d/1t8Zr4maueR_lJsNkfSGnoFuPpGrZbMZa/view), 13.28 s | The opening image gains prominence before the brand-mask transition. | A framed-photo-to-fullscreen entrance using the existing, authentic first property image. The existing O already supplies the branded mask idea. |
| [Web Love / interior tour](https://drive.google.com/file/d/1uuW0hxNZd1SB6WZ-8eoc0hWv3Ox9V921/view), 10.96 s | A continuous camera journey through modeled interiors. | No modeled property tour: the current authentic Oaktown photography remains authoritative. |
| [Zohair / dashboard](https://drive.google.com/file/d/1_D_AzDIq_DRm-l7y3x-taexb-27-Ww7O/view), 28.56 s | Identity entrance, login and a business dashboard. | Brief arrival pacing only. Private administration and authentication remain unchanged. |
| [EstateHub screenshot](https://drive.google.com/file/d/19rvOmSMCllo-wnvrnqX52TsJd_EIu6Mj/view) | Clear property-image/card hierarchy. | Retain the already approved rental-card readability; no additional catalogue redesign. |

## Implemented experience

- On the first eligible homepage visit in a tab, the location/chapter label, headline and description enter in a short sequence. Desktop text settles within approximately 740 ms.
- If the first authentic property photograph loads within the initial 700 ms, it expands from a subtle 90% frame to the full stage over 900 ms. It reuses the existing image element and source; no new photo, video or animation dependency is requested.
- Phones and short windows use lighter text motion and a 420 ms opacity-only photo arrival.
- Header/navigation, View Homes and chapter controls remain available throughout. There is no blocking overlay, fake loading percentage, scroll lock or longer introduction.
- Scrolling, wheel/touch/pointer input, keyboard navigation, window resizing, hiding the tab or disabling motion immediately cancel the entrance and restore the settled styles. Scroll-driven chapters then behave normally.
- The entrance runs at most once per tab session. Reloading and changing language do not replay it. Reduced motion, saved Motion off and Save-Data skip it. Deep links and restored reading positions skip the opening as well.
- A missing or slow photograph does not delay content or trigger a late surprise animation. The page keeps its existing failed-image state.

All new effects use native Web Animations with transform/opacity. Completion and cancellation clear their effects; no idle animation loop or persistent transform is added.

## Review media — explicitly fallback

The current environment still blocks the original property-photo CDN. These captures show the real site's text entrance and settled layout with its photo-failure treatment. **They do not visually verify the photograph's expansion or final live photo appearance.** The photo-readiness/expansion mechanism is covered separately by isolated decoded-image tests using the original logo as a fixture, never as a published property image or review photograph.

- [Short silent browser recording: text entrance, blocked-photo fallback](opening-text-fallback.mp4)
- [Desktop first capture](desktop-entrance-fallback.png) · [Desktop settled](desktop-settled-fallback.png)
- [Spanish phone entrance](mobile-es-entrance-fallback.png) · [Spanish phone settled](mobile-es-settled-fallback.png)
- [Reduced-motion capture](reduced-motion-entrance-fallback.png)
- [Capture observations](capture-notes.json)

Screenshot timing is approximate; initial browser-navigation time is trimmed from the short recording so it focuses on the text entrance. It is not a loading-performance measurement. Actual animation observations are recorded with each capture. All six captures have no page errors or horizontal overflow, with View Homes inside the viewport. Real-photo entrance acceptance remains pending CDN access.

## Validation

- 19 new opening checks passed: startup height reservation, immediate actions, once-per-tab behavior, reload/language changes, interruption, saved/OS motion preferences, Save-Data, decoded/late image handling, lighter phone treatment and clean completion.
- Existing public browser suite: 46 checks passed.
- Design suite: 35 checks passed.
- Motion suite: 31 checks passed.
- Cinematic suite: 18 checks passed, including photographic O guards, cached geometry, no idle rendering and filtered perspective browsing.
- CMS/security: 3 tests passed. Mint Mojo regression suite passed.
- Root and browser JavaScript syntax checks and whitespace checks passed.

Production changes are confined to `effects.js` and one public, scoped startup-height rule in `brand.css`. That rule keeps the footer below the initial viewport while authoritative content loads; the approved settled composition and HTML stay the same. Content, original assets, admin/CMS/authentication, Cloudflare infrastructure, Mint Mojo and publication configuration are unchanged. This is a review branch, with no merge or deployment performed.

To repeat the checks against a static server on 8793:

```sh
OAKTOWN_BASE_URL=http://127.0.0.1:8793 npm --prefix tests run test:opening
OAKTOWN_BASE_URL=http://127.0.0.1:8793 npm --prefix tests run test:browser
OAKTOWN_BASE_URL=http://127.0.0.1:8793 npm --prefix tests run test:design
OAKTOWN_BASE_URL=http://127.0.0.1:8793 npm --prefix tests run test:motion
OAKTOWN_BASE_URL=http://127.0.0.1:8793 npm --prefix tests run test:cinematic
```
