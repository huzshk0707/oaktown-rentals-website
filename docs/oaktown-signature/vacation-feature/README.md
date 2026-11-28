# Homepage vacation feature review

[Feature preview](https://felix-vacation-feature-oaktown.rentals10.workers.dev/) · [Draft PR #32](https://github.com/huzshk0707/oaktown-rentals-website/pull/32)

| Chromium viewport | Before and after | Full-size baseline | Full-size hosted feature |
| --- | --- | --- | --- |
| Desktop English, 1440 × 900 | [Compare](compare-desktop.jpg) | [Before](before-desktop.jpg) | [After](after-desktop.jpg) |
| Mobile English, 390 × 844 | [Compare](compare-mobile.jpg) | [Before](before-mobile.jpg) | [After](after-mobile.jpg) |
| Mobile Spanish, 390 × 844 | | [Before](before-mobile-es.jpg) | [After](after-mobile-es.jpg) |

Baseline screenshots use the local shared checkout at `bc163b2`. The after screenshots use the hosted Cloudflare branch preview for runtime `ac5b24e96ecc8c91b555ea9f2721cb6b6b2f95e6`. All use the same section alignment and reduced motion for comparison. Mobile screenshots use Chromium emulation.

The original daytime house-and-pool exterior shows the raised house, veranda and pool together. The 1440 × 959 image gives the wide frame more detail than the pool-only view. The deployed original matches the repository bytes. [Original gallery and source records](../../mint-mojo-media.md)

## Verification

Node 24.22.1, Chromium, local server on port 8951. All eight commands passed.

```sh
npm run check
npm test
export OAKTOWN_BASE_URL=http://127.0.0.1:8951
node tests/browser.cjs
node tests/signature.cjs
node tests/sky-header.cjs
node tests/mint-mojo.cjs
node tests/design.cjs
node tests/collection.cjs
```

Focused browser checks at widths 320, 390, 760, 768, 1024 and 1440 confirmed a full-width stacked photograph through 760px and a 57% photograph above it. Keyboard focus and horizontal fit passed at every width. Desktop Enter opened the dedicated vacation page. Image hover reached 1.025× and reduced motion disabled the zoom. A scoped axe scan reported zero violations.

The hosted root HTML, homepage script, signature stylesheet and property photograph matched the checkout. The preview declared noindex, robots excluded all crawlers, the inventory endpoint reported file mode, the unconfigured admin session returned 503 and the handoff file returned 404. Desktop English and mobile English/Spanish screenshots verified the ivory background, 12px button radius, translated location and destination link.
