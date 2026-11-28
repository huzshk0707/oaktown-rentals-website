# Bethune Lofts motion study

Ravi reviewed the live [Bethune Lofts homepage](https://bethuneloftsdetroit.com/) in Chromium at 1440×1000 and 390×844. The study sampled scroll position, transforms, opacity and panel sizes, tested hover, thumbnail selection, menu and FAQ interactions, and repeated desktop scrolling with reduced motion enabled. The main images and Framer runtime loaded. Some external fonts and icon modules and the embedded map were blocked, so typography, icon rendering and map behavior were outside the verified scope.

| Observed effect | Oaktown application |
| --- | --- |
| The building photo scrolls slower than the hero copy. At 150, 350 and 700px scroll, its offset was 45, 105 and 210px. | Keep the approved Afterglow camera. Try a much smaller clipped drift on the Louisville panorama and a static crop for motion-off and narrow screens. |
| The header changes from transparent over the hero to white deeper in the page, hides on downward scroll and returns on upward scroll. The mobile burger opens a stacked menu, and its lines turn into a close icon. | Borrow the open/close polish for the existing mobile menu. Keep access to Our Homes and Apply Online predictable. |
| Five photos share one display frame. Selecting a thumbnail changes the image, and an advancing fill indicates timed playback. A slide advanced during a six-second observation with reduced motion enabled. | Reuse the visual idea of a clear selected thumbnail and a stable frame for property detail. Keep movement user-controlled by default and honor Oaktown's existing motion preference. |
| “Explore Your Options” has three tall photo panels. At 1440px, each was about 429px wide. Hover grew one to 644px and narrowed the other two to about 322px; the image frame stayed 600px tall. | The strongest signature effect for a separate editorial navigation section. Use original Oaktown photography, labels that remain visible, keyboard focus, tap controls and a static stack on small screens. The approved collection stays fixed-width. |
| FAQ answers expand in place. The second answer grew from about 97px at the 100ms sample to 116px when settled, while the first remained open. | A short open/close transition and a clear expanded state would suit Resources and the future Before You Apply experience. |
| Desktop wheel input eased toward its final position through Lenis. Both reduced-motion and normal runs still showed smooth wheel movement and hero parallax. | Keep native scrolling. Apply easing to individual transforms and controls so users retain normal scroll response. |

Start with one editorial panel prototype and a subtle Louisville image entrance. The [Phase 2D review](phase2d/README.md) already has an isolated panel and map proposal and [before/hover captures](phase2d/research/bethune-options-hover.png). Use one optional enhancement per section and retain the existing photo navigation, English/Spanish controls, visible focus and reduced-motion behavior. Existing Boutiques already provide photo crossfades and the selected-image transition into detail. The study is a creative reference for future review.

## Phase 2E typography and navigation observation

A fresh 1440×900 Chromium run inspected the live desktop header and hovered About Us. The menu holder measured 1344×67px, 48px from either edge and 12px from the top. The About Us label was 16px Raleway, weight 400, normal spacing and 19.2px line height. The document's primary Raleway faces loaded from the Framer asset host. The H1 declared Italiana, weight 400, normal spacing, 150px size and 150px line height. The Italiana and Lora requests to fonts.gstatic.com were blocked, so the displayed H1 used its available serif fallback during this inspection.

The About Us underline measured 1px wide at opacity zero initially, about 55px wide at 100ms and 69px at full opacity after settling. The visible desktop links lead to pages. The burger opens a separate light panel with large destination links and a photo at desktop widths, and the narrow version stacks the links. This observation informs the scoped Oaktown disclosures, which are positioned directly below their triggers.

Oaktown retains Georgia with Times New Roman and serif fallbacks for the hero, and its already self-hosted DM Sans for the header. The existing [DM Sans license](../../assets/fonts/) stays with the asset. The header uses a 14–17px navigation scale with roughly 1.4 line height and a 220ms left-origin underline. No additional font request or distribution of Bethune assets is needed.

## Phase 2E final button interaction

A fresh 1440×900 Chromium session hovered Bethune’s visible hero Apply Now link and sampled its real painted controls. The button stayed 151.75×49.59px at the same coordinates. The white fill shifted toward blue at 85ms and settled at RGB 101, 149, 168 by the last sample. The visible label shifted from near black to white. The sampled button kept its 50px radius and had no visible arrow or moving internal element. Color interpolated through Framer’s runtime. The sampled computed transition did not establish an exact authored duration or easing. See [the measurements](phase2e/final/bethune-hover.json).

The Oaktown buttons adopt the color exchange using a 220ms transition, with no change to size or placement on hover. The accepted sage primary deepens to olive, and the outlined secondary fills with warm ivory. Both use a 12px radius rather than the reference's pill shape. The dropdown stagger is an Oaktown refinement.
