# Oaktown Signature — approved master roadmap

Approved by the owner on 27 November 2026. Creative direction and visual acceptance belong to the owner and ChatGPT. FELIX continued Phase 1B engineering, implementation and verification under explicit reassignment. This roadmap records the direction; **it does not authorize implementation of every phase**.

## Current delivery

Continue [draft PR #26](https://github.com/huzshk0707/oaktown-rentals-website/pull/26) on `felix/oaktown-signature`. The existing homepage, search controls, cards and supporting sections are a first implementation, not visual acceptance. Preserve that work. Phase 1B engineering and regression verification are complete. Phase 1B visual and enhanced-photo architectural review remain pending. Ravi completed Phase 2A engineering. FELIX verified all 60 hosted photos and prepared the separate [Phase 2B editorial proposal](phase2b/README.md). Detailed owner/ChatGPT approval remains required before Phase 2C styling.

| Phase | Approved direction | Status / prerequisites |
| --- | --- | --- |
| 1 | Signature hero and navigation | **Superseded by approved Phase 1B motion.** Retain the full-screen Afterglow identity from the exact hero reference. Keep search below the opening viewport; verify desktop/mobile, EN/ES and motion preferences. |
| 1B | Continuous three-scene cinematic hero | **Implemented, awaiting visual/architectural acceptance.** Same enhanced Afterglow image, native sticky scroll, mobile and static reduced-motion fallback. Evidence and exact tests are in [Phase 1B review](phase1b/README.md). Remaining sections retain current design. |
| 1C | Visual and photo acceptance | Owner/ChatGPT review pending; preserve Phase 1B. |
| 2A | Property collection engineering foundation | Engineering implemented: [field/photo audits, reusable cards, single-row horizontal gallery and regression evidence](phase2a/README.md). Hosted photo verification remains pending. Full-width introduction above gallery; remove redundant View All Homes. Fixed original generous gallery dimensions, arrows, desktop edge movement, keyboard/manual/touch navigation; no timer or loop. Hide controls when results fit, preserve widths and left alignment for one/two matches, reset on filtering, respect reduced motion. |
| 2B | Editorial Collection creative design / approval | Owner and ChatGPT supply final premium mockup; no independent card restyling. This is the approval gate referred to as “Approved Visual Implementation” in the earlier prose brief. |
| 2C | Approved visual implementation | Implement the approved Phase 2B mockup only after explicit direction. The latest gallery decision supersedes the earlier three-card/multi-row homepage assumption; retain all matching homes in one row. |
| 3 | Dedicated property search page | Planned. Existing homepage filters remain operational; a dedicated page is not yet authorized. Use supported neighborhood, bedroom and bathroom fields, not invented property types. |
| 4 | Individual property detail pages | Existing detail routes, gallery, rental facts and showing links remain functional. Redesign awaits direction. |
| 5 | Before You Apply experience | Planned. Requires verified requirements, policies and approved copy. |
| 6 | Showing and application workflow | Existing SMS showing links and Fillout application remain intact. Future workflow changes require approval. |
| 7 | Branded email and trust improvements | Planned. Requires approved sender/provider, verified company details and relevant legal copy. No invented guarantees or claims. |
| 8 | Interactive property map | Planned. Requires verified public property locations, accessible list fallback and an approved map/provider approach. |
| 9 | Lobster Nirvana premium direct-booking experience | Separate [PR #25](https://github.com/huzshk0707/oaktown-rentals-website/pull/25). Preserve booking approval gates; do not merge it into this design task, activate payments or alter inventory. |
| 10 | Community and neighborhood guides | Verified community links already exist. New guides require authentic local information and creative approval. |
| 11 | Authentic tenant testimonials | Planned. Requires actual approved testimonials and consent. Do not invent quotes, names, ratings or reviews. |
| 12 | SEO, accessibility, performance and launch preparation | Ongoing technical checks support Phase 1. Full launch requires owner visual/content approval, confirmed photo rights and separate merge/production authorization. Preserve preview noindex until approved. |

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

Follow [AGENTS.md](../../AGENTS.md). Continue the existing branch/PR, preserve all other worktrees, normal-push small checkpoints at least every 15–20 minutes and after meaningful milestones. Refresh owner heartbeat/claim, update [HANDOFF.md](../../HANDOFF.md), [TASKS.md](../../TASKS.md) and the PR running log. Verify the pushed SHA. Keep one precise NEXT STEP and all browser evidence in the repository. Keep PR #26 draft for visual acceptance.

## Phase 1B approval

The three-scene reference supplied on 27 November supersedes static hero behavior. FELIX owns implementation under explicit reassignment. The owner approved the existing public Workers preview for the AI-assisted enhanced asset. Compare it with the retained genuine original and obtain architectural accuracy approval before production. Capture all three scenes, search transition and forward/reverse recording.

## Phase 2B verification and preparation checkpoint

Hosted photography is verified against all 60 manifest URLs, all four original source pages and every detail selection. Current browser evidence resolves the earlier environment-specific CDN blocker. Read [PHOTOGRAPHY.md](phase2b/PHOTOGRAPHY.md) for genuine-source resolution/crop limitations.

[Editorial treatment](phase2b/EDITORIAL-PROPOSAL.md) is a reversible browser-only prototype, with actual loaded-photo comparison and EN/ES mobile evidence. It preserves the approved horizontal layout and fixed widths. Public card styling and the Phase 1B hero are unchanged. NEXT STEP is owner/ChatGPT detailed treatment approval; no implementation of Phase 2C or later phases is implied.
