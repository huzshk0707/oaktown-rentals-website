# Oaktown Signature — approved master roadmap

## Remaining release and design work

| Owner | Work |
| --- | --- |
| Felix Junior with the owner | Complete property photography, source-rights records and current-condition review. |
| Felix | Finish lower property detail sections. Redesign the dedicated Lobster Nirvana experience. |
| Felix | Add the premium bilingual homepage FAQ in [issue #36](https://github.com/huzshk0707/oaktown-rentals-website/issues/36). Review existing FAQ, Community and Contact pages. |
| Felix | Complete website-wide micro-interaction polish after the page work. |
| Ravi | Rehearse CMS migration on isolated staging. Production currently serves the file catalogue. |
| Booking team and owner | Complete isolated booking staging acceptance under [issue #37](https://github.com/huzshk0707/oaktown-rentals-website/issues/37). |
| Ravi and owner | Complete final content, accessibility and performance review and resolve the publication holds. |


Approved by the owner on 27 November 2026. Creative direction and visual acceptance belong to the owner and ChatGPT. FELIX continued Phase 1B engineering, implementation and verification under explicit reassignment. This roadmap records the direction; **it does not authorize implementation of every phase**.

## Shared integration foundation

[Draft PR #29](https://github.com/huzshk0707/oaktown-rentals-website/pull/29) on
`integration/oaktown-signature` combines reviewed work from #26, #27, #28, #30 and #31 and
is the base for future isolated Signature feature PRs. Ravi coordinates the
[shared integration and preview](integration/README.md). Earlier PRs and
checkpoints remain available as source history. The [Bethune motion study](BETHUNE-MOTION-STUDY.md)
informs later creative review. Booking PR #25 stays on its separate staging path.

## Current delivery

Phase 4B step 1 refines the property opening and fullscreen gallery on the Phase 4A feature branch lineage. [Draft #34 review evidence](phase4b-opening/README.md). Owner review precedes any work on lower sections.

**Major homepage design is complete and locked.** The owner approved Phase 3 at `1b75145`, now integrated in [draft PR #29](https://github.com/huzshk0707/oaktown-rentals-website/pull/29). Phase 4A uses Colonial Drive as the reference for shared property styling and interactions. The scoped feature is ready for owner review in draft #33. [Comparison and verification](phase4a/README.md). Phase 4B covers individual layout decisions after owner instructions.

[Draft PR #26](https://github.com/huzshk0707/oaktown-rentals-website/pull/26) retains the source history for the homepage, search controls and cards. Ravi completed Phase 2A engineering. Felix verified 60 hosted photos at the earlier checkpoint and prepared the [Phase 2B editorial proposal](phase2b/README.md). The owner approved Option B — Boutique Luxury (Drive `1V7gfl1owIOQzIOOUFNxc0E95iJHGyhH9`). Ravi completed the [Phase 2C implementation and review evidence](phase2c/README.md). Enhanced Afterglow photo accuracy remains a production approval.

| Phase | Approved direction | Status / prerequisites |
| --- | --- | --- |
| 1 | Signature hero and navigation | **Superseded by approved Phase 1B motion.** Retain the full-screen Afterglow identity from the exact hero reference. Keep search below the opening viewport; verify desktop/mobile, EN/ES and motion preferences. |
| 1B | Continuous three-scene cinematic hero | **Opening composition accepted in Phase 2E.** Enhanced Afterglow accuracy remains a production approval. Same enhanced image, native sticky scroll, mobile and static reduced-motion fallback. Evidence and exact tests are in [Phase 1B review](phase1b/README.md). Remaining sections retain current design. |
| 1C | Visual and photo acceptance | Owner/ChatGPT review pending; preserve Phase 1B. |
| 2A | Property collection engineering foundation | Engineering implemented: [field/photo audits, reusable cards, single-row horizontal gallery and regression evidence](phase2a/README.md). Hosted photo verification completed by Felix. Full-width introduction above gallery; remove redundant View All Homes. Fixed original generous gallery dimensions, arrows, desktop edge movement, keyboard/manual/touch navigation; no timer or loop. Hide controls when results fit, preserve widths and left alignment for one/two matches, reset on filtering, respect reduced motion. |
| 2B | Editorial Collection creative design / approval | **Approved: Option B — Boutique Luxury.** Exact owner-supplied reference retained in [Phase 2C](phase2c/approved-option-b.png). Generated photography/facts/logo are styling references only, never content. |
| 2C | Approved visual implementation | **Implemented; awaiting visual acceptance.** Approved 38vw desktop cards, warm ivory/champagne pricing, serif titles, genuine photos/facts, functional photo controls, minimal specs and circular detail action. Hero only changes scene-two EN/ES copy; horizontal gallery and existing systems preserved. The latest gallery decision supersedes the earlier three-card/multi-row homepage assumption; retain all matching homes in one row. |
| 2E | Seamless Sky Header | Owner-approved [PR #30](https://github.com/huzshk0707/oaktown-rentals-website/pull/30) merged at `48a32cd`. Direct vacation link, rounded buttons and staggered disclosures are in the [shared draft](https://github.com/huzshk0707/oaktown-rentals-website/pull/29). |
| 3 | Homepage Completion and design lock | **Complete.** Owner-approved Phase 3 is integrated. Preserve the approved opening, section order, Louisville Option A and mobile color treatment. [Integration verification](integration/phase3/README.md). |
| Later | Dedicated property search page | Planned. Existing homepage filters remain operational; a dedicated page is not yet authorized. Use supported neighborhood, bedroom and bathroom fields, not invented property types. |
| 4 | Individual property detail pages | Next design reference is 115 Colonial Drive for all six properties. Existing details, galleries, facts and showing links carry forward. Begin after owner design instructions. |
| 5 | Before You Apply experience | Planned. Requires verified requirements, policies and approved copy. |
| 6 | Showing and application workflow | Existing SMS showing links and Fillout application remain intact. Future workflow changes require approval. |
| 7 | Branded email and trust improvements | Planned. Requires approved sender/provider, verified company details and relevant legal copy. No invented guarantees or claims. |
| 8 | Interactive property map | Planned. Requires verified public property locations, accessible list fallback and an approved map/provider approach. |
| 9 | Lobster Nirvana premium direct-booking experience | Separate [PR #25](https://github.com/huzshk0707/oaktown-rentals-website/pull/25). Preserve booking approval gates; do not merge it into this design task, activate payments or alter inventory. |
| 10 | Community and neighborhood guides | Verified community links already exist. New guides require authentic local information and creative approval. |
| 11 | Authentic tenant testimonials | Planned. Requires actual approved testimonials and consent. Do not invent quotes, names, ratings or reviews. |
| 12 | SEO, accessibility, performance and launch preparation | Ongoing technical checks support Phase 1. Full launch requires owner visual/content approval, confirmed photo rights and separate merge/production authorization. Preserve preview noindex until approved. |

## Proposed delivery order after Phase 2E

1. Homepage opening refinements approved and integrated from [PR #30](https://github.com/huzshk0707/oaktown-rentals-website/pull/30).
2. Review property photography using the latest owner-approved Drive folders and verified property accuracy, reuse rights and attribution. Refer to the [per-property tasks](../../TASKS.md#photography-and-content-backlog).
3. Phase 3 — Homepage Completion, owned by Felix. Review Our Homes, Louisville, Our Story, editorial panels and the vacation feature.
4. Use 115 Colonial Drive as the reference for all six property detail pages once the owner provides the design instructions.
5. Refine the dedicated Lobster Nirvana experience. Keep booking on its separate staging approval path.
6. Complete Resources, FAQ, Community and application guidance.
7. Polish interactions across the finished website.
8. Prepare release after content approval, CMS readiness, accessibility, performance and production authorization.

This order records planning priorities. The approved Phase 2E opening and Phase 3 homepage are locked. Future sections and release await their own reviews.

## Phase 3 — Homepage Completion

The approved homepage sequence is locked: cinematic hero → Our Homes with search, Gallery and Grid → standalone Rooted in Louisville → Your Rental Journey → compact Lobster Nirvana → existing footer. The Louisville panorama uses the exact Option A photograph with the lighter overlay and documented license. The existing mobile color correction remains in effect. [Final design reference](phase3/final/README.md) · [Combined verification](integration/phase3/README.md).

## Phase 4 — Property detail design reference

Start with [115 Colonial Drive on the shared preview](https://integration-oaktown-signature-oaktown.rentals10.workers.dev/#home/115-colonial-drive). Its 19 ordered gallery images and current EN/ES rental facts and showing/application actions are the baseline. Once the owner provides instructions, use an isolated feature branch from the current shared tip. Review the Colonial design before adapting it to all six properties, including Cherokee #8’s distinct unit, Sloemer’s unconfirmed terms and Troutwood’s contact-only and no-photo state. This checkpoint records preparation only. The dedicated search page is a later deliverable.

## Phase 1 source of truth

- [Approved assets folder](https://drive.google.com/drive/folders/1GRRZgQN61mry20YFAut2ixFmSU9xAsSJ).
- [04-approved-hero-exact-reference.png](https://drive.google.com/file/d/12F4a_BJNqqz5jUb5w114R_PWJNXnPZLo/view) supersedes the earlier master mockup **for the opening viewport**.
- Genuine primary photograph: `02-afterglow-original-listing-photo.png` (8216 Afterglow Drive).
- Genuine secondary photograph: `03-colonial-original-listing-photo.png` (115 Colonial Drive).
- Match full-screen proportions, forest-green navigation/gradient, editorial serif hierarchy, ivory CTA and alignment. Do not use the reference's altered house rendering as a photograph.
- Navigation remains Our Homes, Lobster Nirvana, Our Story, Resources (FAQ and Community), language switch and Apply Online. **No Resident Portal exists; omit it.** Preserve motion controls and simple mobile navigation.
- Keep the supplied original Oaktown logo unchanged unless the owner supplies/approves a replacement asset explicitly.

## Systems and content boundaries

Keep the working file catalogue and CMS compatibility. No production inventory migration or schema change. Document any CMS migration as a separate follow-up; validate source records and authorization before executing it.

Preserve Leslie's private admin, authentication/Access, Cloudflare Workers, D1/R2, publication workflows, application destinations, bilingual pages and property galleries. Do not independently redesign unapproved future sections. No merge, production deployment, live inventory change or payment activation is authorized by this document.

Use “Our Homes” where availability is unverified. Do not copy sample pricing/specifications from mockups or label a home “Ready Now” without confirmation. Afterglow is a brand photograph, not an inventory addition. Confirm ownership/management status and photograph reuse authorization before production deployment.

## Delivery and recovery protocol

Follow [AGENTS.md](../../AGENTS.md). Continue the existing branch/PR, preserve all other worktrees, normal-push small checkpoints at least every 15–20 minutes and after meaningful milestones. Refresh owner heartbeat/claim, update [HANDOFF.md](../../HANDOFF.md), [TASKS.md](../../TASKS.md) and the PR running log. Verify the pushed SHA. Keep one precise NEXT STEP and all browser evidence in the repository. Keep the combined PR #29 draft. Historical source PR #26 stays available for review.

## Phase 1B approval

The three-scene reference supplied on 27 November supersedes static hero behavior. FELIX owns implementation under explicit reassignment. The owner approved the existing public Workers preview for the AI-assisted enhanced asset. Compare it with the retained genuine original and obtain architectural accuracy approval before production. Capture all three scenes, search transition and forward/reverse recording.

## Phase 2B verification and preparation checkpoint

Hosted photography is verified against all 60 manifest URLs, all four original source pages and every detail selection. Current browser evidence resolves the earlier environment-specific CDN blocker. Read [PHOTOGRAPHY.md](phase2b/PHOTOGRAPHY.md) for genuine-source resolution/crop limitations.

[Editorial treatment](phase2b/EDITORIAL-PROPOSAL.md) is a reversible browser-only prototype, with actual loaded-photo comparison and EN/ES mobile evidence. It preserves the approved horizontal layout and fixed widths. Public card styling and the Phase 1B hero are unchanged. NEXT STEP is owner/ChatGPT detailed treatment approval; no implementation of Phase 2C or later phases is implied.
