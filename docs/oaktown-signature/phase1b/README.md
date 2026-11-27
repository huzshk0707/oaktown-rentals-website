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

## Verification in progress

Syntax checks and 19 Signature browser groups passed. Forward/reverse camera, responsive/static fallbacks, broader regressions and actual visual evidence are being completed. This checkpoint is implementation work in progress. Keep PR #26 draft.
