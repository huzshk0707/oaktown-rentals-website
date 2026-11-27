# Phase 1B — continuous cinematic hero

The owner approved a short three-scene scroll experience on draft PR #26. The implementation uses one enhanced Afterglow image with native sticky positioning, continuous entrance-centered scale from 1 to 1.82, and reversible text transitions. The desktop section spans 2.2 viewport heights. Visitors can jump directly to homes using the first scene or navigation.

Mobile, short windows, data-saving connections, Motion off and reduced-motion preferences receive one static opening with the core message and homes action. Scene buttons are keyboard-operable on desktop. Inactive scenes are inert and hidden from accessibility APIs. Search and subsequent sections retain the previous implementation.

## Asset provenance and approval

- Enhanced Afterglow was supplied by the owner for design review. Source https://drive.google.com/file/d/1Dq16QgaeHQg_O67IR2AePbiHXjBM1Z7C/view
- The three-scene reference supplies motion/composition direction. Source https://drive.google.com/file/d/1XX_gMpD87dSLzp6mLxXh3qbx6RYP3uBQ/view
- Genuine original source https://drive.google.com/file/d/1SaEosn1dwZMbadMsT0Mn9FtuPAuHR1t7/view
- All three source files are retained here with SHA-256 values in asset-hashes.json. This directory is excluded from public static deployment.
- Public review derivatives are assets/signature/afterglow-review-{480,768,1200,1672}.webp, converted and downsampled from the supplied enhancement at WebP quality 89. No further generative edits were made.
- The owner confirmed original property ownership/management and photo reuse permission in this conversation, and subsequently explicitly approved using the existing public Workers preview for the enhanced-photo review.
- The supplied enhancement visibly changes lighting, tree/lawn appearance and framing. Door/entry trim, window reflections and facade details also differ in apparent rendering. The genuine original is soft and framed differently, so exact architectural equivalence cannot be established from these images. The enhancement requires explicit architectural accuracy approval before production use.
- The different house and invented close-ups in the three-scene reference are excluded from the implementation.

## Review evidence

- [Reference, previous opening and three new scenes](comparison.jpg).
- [Scene 1 — Welcome](scene-1.png), [Scene 2 — Connection](scene-2.png), [Scene 3 — Discovery](scene-3.png), and [transition into search](search-transition.png), each 1672×941.
- [Forward and reverse recording](forward-reverse.webm), actual Chromium capture, 15.56 seconds at 1440×900. The test drives native scroll positions through all scenes, into search and back to the beginning. Video decoded successfully with ffmpeg and sampled frames were visually reviewed.
- [Mobile](mobile.png), [Spanish mobile](mobile-es.png), [320px Spanish](narrow-es.png), [tablet](tablet.png), [Spanish desktop](desktop-es.png), and [reduced motion](reduced-motion.png).
- [Actual public preview browser capture](live-preview.png). Preview https://felix-oaktown-signature-oaktown.rentals10.workers.dev/
- [Capture measurements](capture-report.json) confirm the same image across scenes, scale 1 → 1.41036 → 1.82, loaded hero assets and no horizontal overflow at all captured sizes.

Compared with the approved reference, the implementation retains the left editorial hierarchy, ivory/champagne text, green photographic shading and progressive approach to the entrance. It uses the supplied Afterglow photograph throughout. The original Oaktown logo and current approved navigation remain. The entrance crop is intentionally limited to 1.82× because the source has 1672×941 pixels. It does not reproduce the reference's invented close-up or sample rental facts. The final image is softer at maximum zoom. These are engineering-complete review assets, not owner visual acceptance.

The search-transition capture includes the unchanged catalogue's failed-image placeholders. Local behavioral suites deliberately block external photos. This evidence does not establish successful loading of the external Squarespace rental galleries. Confirm those images in a browser with CDN access before complete photo acceptance.

## Verification results

Runtime implementation tested at `d14efce`. The final evidence checkpoint adds documentation/capture scripts and replaces two redundant browser test success markers with explicit state assertions. The 45-check browser suite passed again after that refinement.

Node 24 and system Chromium were used. Local site served from this branch on `http://127.0.0.1:8931`.

| Command | Result |
| --- | --- |
| `npm run check` | PASS, JavaScript syntax checks |
| `npm test` | PASS, 3 CMS/security groups |
| `OAKTOWN_BASE_URL=http://127.0.0.1:8931 node tests/signature.cjs` | PASS, 19 groups |
| `OAKTOWN_BASE_URL=http://127.0.0.1:8931 node tests/motion.cjs` | PASS, 9 groups including EN/ES forward/reverse camera, no idle advance, focus/inert safety, shortcuts, stable motion toggle and responsive fallbacks |
| `OAKTOWN_BASE_URL=http://127.0.0.1:8931 node tests/browser.cjs` | PASS, 45 checks |
| `OAKTOWN_BASE_URL=http://127.0.0.1:8931 node tests/design.cjs` | PASS, 33 checks |
| `OAKTOWN_BASE_URL=http://127.0.0.1:8931 node tests/browsing.cjs` | PASS, 24 checks |
| `OAKTOWN_BASE_URL=http://127.0.0.1:8931 node tests/audit.cjs` | PASS, 15 groups |
| `OAKTOWN_BASE_URL=http://127.0.0.1:8931 node tests/mint-mojo.cjs` | PASS, gallery, keyboard/focus, dates, inquiry, EN/ES, navigation, motion and six widths |
| `npm run test:admin-browser` | PASS, disposable admin workflow |
| `npm run test:photo-order` | PASS, mouse/touch/keyboard photo ordering and isolation |
| `npm run test:admin-improvements` | PASS, 6 groups |
| `OAKTOWN_AXE_PATH=/tmp/signature-axe/node_modules/axe-core/axe.min.js node tests/capture-phase1b-accessibility.cjs` | PASS, 7 hero scans, zero confirmed WCAG violations |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/signature-browsers node tests/capture-phase1b.cjs` | PASS, 10 screenshots and recording |

[Detailed browser test outputs](test-results/) and [axe results](accessibility.json) are retained. Axe could not automatically resolve text contrast over photographs/gradients. This remains a manual review item, not an asserted automated pass. Native Safari/Firefox, assistive-technology testing and production email-code sign-in were not exercised.

The public Workers URL returned HTTP 200. Deployed `app.js`, `signature.js`, `signature.css` and `afterglow-review-1672.webp` matched local SHA-256 hashes. The Cloudflare integration reported a successful check for `d14efce`. The remote Chromium capture needed `ignoreHTTPSErrors` in the disposable test context because the environment browser reported `ERR_CERT_AUTHORITY_INVALID`. No website TLS, security or Access settings were changed. Thus that screenshot proves rendered content, not independent certificate validation.

## Handoff

Phase 1B implementation and evidence are complete. Keep PR #26 draft. The NEXT STEP is owner review of `comparison.jpg`, `forward-reverse.webm` and the public preview, followed by explicit architectural accuracy approval of the enhanced photo against `genuine-afterglow.png`. No later homepage phase is authorized by completion of this task. Production, inventory, payments and separate direct-booking gates remain unchanged.
