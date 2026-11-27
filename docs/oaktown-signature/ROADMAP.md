# Oaktown Signature — approved master roadmap

Approved by the owner on 27 November 2026. Creative direction and visual acceptance belong to the owner and ChatGPT. Ravi handles engineering, implementation and verification. This roadmap records the direction; **it does not authorize implementation of every phase**.

## Current delivery

Continue [draft PR #26](https://github.com/huzshk0707/oaktown-rentals-website/pull/26) on `felix/oaktown-signature`. The existing homepage, search controls, cards and supporting sections are a first implementation, not visual acceptance. Preserve that work. Immediate priority is Phase 1, plus outstanding regression checks for existing functionality.

| Phase | Approved direction | Status / prerequisites |
| --- | --- | --- |
| 1 | Signature hero and navigation | **Active.** Perfect the full-screen Afterglow opening against the exact hero reference. Keep search below the opening viewport; verify desktop/mobile, EN/ES and motion preferences. |
| 2 | Premium property cards | Initial homepage cards exist. Further creative work awaits Phase 1 acceptance and specific direction. Preserve genuine pricing, addresses, unit photos and unknown availability. |
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
