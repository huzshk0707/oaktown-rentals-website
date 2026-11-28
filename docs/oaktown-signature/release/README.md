# Signature release candidate

The shared candidate incorporates #33, #34 and #35 through `b145c82`, the light vacation feature #32 through `26b0344`, #26 review evidence through `0b65477` and Felix Junior’s full #28 photography through `e03255d`. The tested website checkpoint is `08d441294c67574f3fde0917922a2baddffb1f6d`. [Combined preview](https://integration-oaktown-signature-oaktown.rentals10.workers.dev/) · [Open release PR #29](https://github.com/huzshk0707/oaktown-rentals-website/pull/29).

Both sides of #32’s coordination logs were retained. #26’s head is in the candidate’s ancestry, with its historic prototype evidence and updated captures. The current prototype and newer runtime were retained when their history differed. The review-only vacation clone now follows the light vacation feature. #27 was previously closed after its head was integrated. #26 and #28 were closed as superseded. #25 was retired after recording its branch, SHA, provider acceptance and recovery in [issue #37](https://github.com/huzshk0707/oaktown-rentals-website/issues/37). All source branches and existing worktrees were preserved.

## Production preflight

Production returned HTTP 200. Its homepage bytes matched main at `be37dba83e21667d1b5291888153f8d5afaaa823`, the pre-release rollback reference. The production API returned file mode. Worker configuration and server-side CMS code matched main. Main is an ancestor of the candidate. No live migration, payment activation or production release was performed.

The owner approved proceeding with the selected visuals. The release record still needs the following evidence before main triggers deployment.

- **Afterglow.** The enhanced hero has visual approval. The architectural accuracy check against the genuine Afterglow photo remains outstanding. [Comparison sources](../phase1b/README.md).
- **Smallboat.** The six revised files are approved for the draft. Confirm the revised floor, fixtures, cabinetry, exterior and carpet reflect current conditions. Resolve the legacy reuse and attribution terms, particularly the 2015 broker notice on originals 14 and 15. The integration contains Junior’s approved exports without further edits. [Junior’s source and decision record](../FELIX-JUNIOR-PROPERTY-EXPANSION.md).
- **Other photo rights.** Junior should record publication provenance for the six staged Cherokee imports and eight Sloemer originals. Cherokee retains three existing listing URLs. Its six imported files and all other imported assets match Junior’s Git blobs exactly.
- **Listing facts.** Confirm Troutwood’s inferred January 2027 timing or approve revised public copy. It is contact-only with a photo-pending state. Sloemer has no confirmed rent, deposit or availability and uses inquiry copy. Verify current Madison “coming soon” status and public pricing/availability with the owner. No unverified prices were added during consolidation.
- **Catalogue.** File mode is active and compatible. A future database transition requires a separate staging rehearsal. It is not a prerequisite for the current file-mode build. The existing preview noindex policy is retained.

## Verification

The hosted verifier checked six rental routes, 68 ordered real gallery selections and 50 local rental images against their SHA-256 hashes. All six property records and the entire ordered image catalogue matched Junior’s source. The universal navigation journey covered 14 routes at desktop and phone widths, preference restoration and the manual fullscreen viewer. Homepage checks covered the full-height Louisville panorama, reduced motion, EN/ES and mobile light/dark/automatic-darkening colors. The light vacation feature loaded its photo, linked directly to Lobster Nirvana and fit 320, 390, 768 and 1440px widths. Mobile evidence uses emulated Chromium. [Phone capture](mobile.jpg) · [Mobile palette measurements](mobile-colors.json) · [Catalogue and hashes](catalogue.json) · [Test transcripts](checks).

The combined hosted scans cover 24 catalogue states, 28 header states and 12 homepage states. All returned zero confirmed axe violations. The transcripts also cover syntax, CMS security, admin editing and photo order, recovery, accessible bilingual navigation, browsing history, inline playback, the manual fullscreen viewer and both review prototypes.

Ravi owns release verification. Felix owns design follow-ups and Felix Junior owns photo provenance. The owner supplies factual approvals. Use the shared integration branch while #29 is held. After a verified main release, use main as the development foundation. [Remaining work](../../../TASKS.md).
