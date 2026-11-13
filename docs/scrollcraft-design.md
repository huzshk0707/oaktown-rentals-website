# ScrollCraft design integration

The public homepage now uses ScrollCraft's canvas frame approach in its existing compact, three-chapter hero. The real listing photos remain sourced from the current inventory. Desktop combines a framed property photo and an abstract green background; listings use a cream comparison section. English/Spanish, gallery navigation, the motion switch, the admin and Mint Mojo retain their existing behavior.

## Source and license

Adapted from https://github.com/singhharsh1708/scrollcraft at commit `7302ab2d2ae0b97e06833046cb45c49553214a58`, specifically `plugins/scrollcraft/skills/scrollcraft/engine/scrollcraft.runtime.js` and the `frames-from-style.mjs` generator. Its MIT license is retained at `assets/scrollcraft/LICENSE.txt`.

The design uses the **catalogue** grammar and **monolith** style with Oaktown's forest-green palette. The generated frames are abstract light, not invented property photography. The existing property collection and D1 snapshots remain authoritative; the standalone reference export does not replace the application.

## Runtime behavior

- The existing 180svh desktop hero supplies section-local progress. No wheel interception, autoplay, audio, external animation package or continuous idle animation loop.
- `scrollcraft.js` adapts ScrollCraft's cover drawing and numbered-frame convention, with at most three concurrent frame loads and eight retained image entries. Canvas pixel density is capped at 1.5.
- Mobile, reduced motion, the persisted motion-off setting, and Save-Data use a single poster. Mobile uses the portrait set. The CSS background remains visible if frames fail.
- Client-side navigation tears down the adapter; pending loads cannot paint into an old route.
- Both generated sets total approximately 0.8 MiB; a visitor downloads only requested frames. All frames are local assets.

## Reproduction

With the pinned ScrollCraft repository checked out at `$SCROLLCRAFT_DIR`, from this repository:

```sh
node "$SCROLLCRAFT_DIR/plugins/scrollcraft/skills/scrollcraft/scripts/frames-from-style.mjs" --style monolith --colors '#071e15,#123b25,#38654a,#0b2c1a' --count 48 --width 1280 --mobile-width 480 --out assets/scrollcraft/desktop --mobile-out assets/scrollcraft/mobile
node "$SCROLLCRAFT_DIR/plugins/scrollcraft/skills/scrollcraft/scripts/build-site.mjs" --spec design/scrollcraft.json --out .wrangler/scrollcraft-reference
node "$SCROLLCRAFT_DIR/plugins/scrollcraft/skills/scrollcraft/scripts/doctor.mjs" --spec design/scrollcraft.json
node "$SCROLLCRAFT_DIR/plugins/scrollcraft/skills/scrollcraft/scripts/verify.mjs" --dir .wrangler/scrollcraft-reference --shots /tmp/scrollcraft-reference-shots
```

FFmpeg is needed only to regenerate the frames. Deployment has no new build dependency. The reference export is ignored and excluded from public assets. In this managed test environment, Chromium needed `--no-sandbox`; `CHROME_PATH` pointed to a temporary wrapper adding that flag for the upstream verifier.

## Validation

The upstream doctor and verifier passed: 16 distinct rendered frames across 16 scroll positions, no missing files, and a lowest measured reference-export copy contrast of 6.97:1. That contrast result belongs to the standalone reference export, not a blanket score for the integrated website.

The integrated browser test (`npm --prefix tests run test:scrollcraft`, with `OAKTOWN_BASE_URL` pointing to a local static server) verifies actual canvas pixel changes, bounded downloads, static mobile/reduced-motion behavior, route teardown, missing-frame fallback, and collection text contrast. Existing 43 public-site browser checks, Mint Mojo checks, backend/security tests and the admin browser workflow passed. Wrangler deployment dry-run passed. Desktop/mobile screenshots were inspected; the environment blocks Squarespace's image CDN, so live photo loading and crops remain unverified.
