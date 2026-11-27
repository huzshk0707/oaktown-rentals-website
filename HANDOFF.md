# WEB-SIGNATURE — Oaktown Signature homepage

- Owner: Codex. Heartbeat 2026-11-26T23:48:07+00:00; claim expires 2026-11-27T00:18:07+00:00.
- Existing branch/PR/base: `felix/oaktown-signature` / draft #26 / `be37dba`. Last pushed checkpoint before this WIP: `53fbb00`. Booking branch and PR #25 remain untouched.
- Done: inspected all approved images and the newer exact hero reference; built forest/ivory public shell, authentic two-photo hero, combined structured filters, compact property collection, Louisville/vacation features, journey and skyline footer. FAQ/community/contact retain verified content as routes. User confirmed no Resident Portal: omitted.
- Assets: only non-generative correction/downsampling of approved Afterglow and Colonial originals. See assets/signature. Baseline screenshots are missing-photo fallbacks, not final verification.
- Recovery checkpoint before Ravi takeover: preserve the six uncommitted responsive CSS refinements and `tests/signature.cjs`. The test passed 19 groups locally; CMS/security 3/3, admin improvements 6/6 and Mint Mojo suite also passed. Existing full-screen Phase 1 refinement has not started.
- Checks so far: app.js and signature.js syntax pass. Initial Chromium screenshots found inherited contrast issues; corrected. Final browser/regression review is still in progress. No implementation tests yet.
- Network limitation: Squarespace photo CDN returns proxy 403. Requested single-host grant via environment tool; confirmation did not complete, no settings changed. Local hero/story/vacation assets load. No missing-photo screenshot is final visual acceptance.
- NEXT STEP: finish responsive/EN-ES/filter/gallery tests and review real browser captures; verify no inherited contrast or navigation regressions. Then push comparison evidence and retrieve an existing Cloudflare branch preview URL if available.
- No merge, production deployment, live inventory/schema changes or payment activation. Afterglow reuse/ownership confirmation remains a production-deployment gate.

---

# Listing and vacation-home refresh

Codex releases the completed implementation claim on `content/refresh-rentals-lobster-nirvana`. Source: current Squarespace property pages and the owner-supplied Airbnb listing. Public browsing, rental and vacation galleries, mobile navigation and admin checks passed. The 60 image URLs match the current property pages in order. The production CMS update was rehearsed against the prior records in disposable SQLite. Next: review PR #24, then apply the scoped CMS refresh through an authorized operator session when approved.

WEB-HERO gallery follow-up complete on draft PR #23. Codex releases the branch claim. Scoped thumbnail timers are shared by the listing and vacation galleries. Playback, browsing, public, vacation, admin browser and CMS checks passed. NEXT STEP: review the property-slideshow screenshot and preview.

# WEB-HERO — premium public hero and buttons

[Draft PR #23](https://github.com/huzshk0707/oaktown-rentals-website/pull/23) on `codex/oaktown-hero`, base c348396. Codex releases the implementation claim. The centered three-scene hero, public action buttons and green/ivory palette are ready for visual review. Desktop, mobile and narrow Spanish captures are in docs/hero-refresh. Syntax, CMS, public browser, opening, audit and design checks passed. NEXT STEP: review the screenshots and draft PR with the owner.

# Active task: WEB-ADMIN-EDITOR

- Account / heartbeat: Codex / 2026-11-16 06:15 UTC. Implementation complete; claim released with this final checkpoint. Root will perform the owner-authorized merge and read-only deployment verification next.
- Branch / base / PR: `feat/leslie-admin-editor` / `152691e` / [PR #22](https://github.com/huzshk0707/oaktown-rentals-website/pull/22). Read live PR state before resuming; do not replay a merged change.
- Scope and authorization: the owner explicitly requested implementation and merge of the admin improvement review. This supersedes the original proposal-only admin scope. Unrelated drafts #7 and #10 are untouched.
- Last verified pushed checkpoint: `8cc4ccb4dab36dd2b68258b6b60dac8e06a99242`; this final evidence/refinement commit follows it. The live branch/PR identifies the exact newer head.
- Done: truthful live/draft dashboard, five editor sections, private unsaved real-page EN/ES previews, retryable upload queue, main-photo choice, readiness links and reviewed publishing. Compact editor header, keyboard tabs and expired/empty preview checks completed.
- Tests: syntax; CMS/security 3/3; admin workflow; improvement suite 6/6 groups; mouse/touch photo-order suite; public browser 48/48 and browsing 24/24. Ten axe scans found zero confirmed violations, with contrast incompletes retained. See [durable evidence](docs/admin-improvements/README.md) and [implementation/results](docs/admin-improvements.md).
- In progress / unfinished files: none after this checkpoint; final merge/check status is tracked by PR #22. Source, tests and screenshot evidence are complete.
- NEXT STEP: run `gh pr view 22 --json state,headRefOid,mergeCommit,statusCheckRollup`. If still open, ensure the final head's Cloudflare check passes, mark ready and merge under the existing owner authorization. If merged, verify its main deployment and do not reapply. Then leave real production sign-in/Leslie acceptance as the bounded follow-up.
- Limits: all mutation tests use disposable local data. No production property records, auth settings, secrets, migrations or deployment configuration were changed. Native Safari/Firefox, screen readers and production email-code sign-in are not proven by local Chromium tests. Main merge triggers the existing Cloudflare deployment.

---

## Previous repository landing context

# Handoff

- Last updated: 2026-11-16 00:55 UTC by ravi
- Current task / branch / PR: WEB-HANDOFF — shared continuation setup complete / `ravi/shared-handoff` / [PR #21](https://github.com/huzshk0707/oaktown-rentals-website/pull/21). This final checkpoint is published to main and the task branch together; verify live refs/PR rather than a local-only hash.
- Active owner: none. ravi releases the completed setup claim with this checkpoint; future work needs its own branch claim.
- Last verified pushed checkpoint before this update: `c6c1f1c48eb40310f464e3362e02d9712fa4e682`; live branch/PR identifies newer checkpoints.
- Done so far: inspected current main/log/branches and live PRs/issues; pushed two WIP checkpoints and opened the setup PR; completed permanent rules, HANDOFF, prioritized TASKS, identical hp/felix starts, PR running-log template and README links; verified relative links and Markdown-only scope; existing relevant tests pass.
- In progress (files being edited): none. Seven Markdown files only; no runtime, database, auth, operational data or existing feature PR changes.
- NEXT STEP (exact and specific): the owner chose Ops Focus Board #70–#73 review first. Open `https://github.com/huzshk0707/Oaktown-ops/blob/main/HANDOFF.md` and its TASKS; claim one unowned OPS-FOCUS-REVIEW substep before editing. If separately assigned website work, claim the relevant WEB task above, use current main and preserve draft #7/#10; do not invent listing facts or publish them.
- Known bugs / blockers: no setup blocker. Never-pushed edits cannot be recovered by another account. Checkpoint every 15–20 minutes and after meaningful steps. This protocol does not supply missing GitHub/provider permissions.
- How to run and test: Node 24; `npm ci`, `npm run check` and `npm test` passed (3/3 CMS/security tests). Relative Markdown links, identical account prompts, seven-file Markdown-only scope and diff checks passed. No browser/runtime changes were made; full UI commands below remain available for future UI work.
- Decisions made and why: use Git commits plus branch handoffs and live PR logs as portable shared memory; preserve existing project rules; keep account identity separate from actual staff attribution. Main landing notes index parallel PRs instead of pretending all accounts share one checkout.

## Publication and next ownership

This commit contains the completed setup state and is normal-pushed atomically to
main and `ravi/shared-handoff`; a rejected transaction publishes neither ref.
Read the current PR/main refs to confirm installation. No unpushed work is part
of the shared handoff. The owner confirmed Ops Focus Board #70–#73 review first;
that choice does not authorize merging/deploying the existing draft stack.

## Repository state to preserve

Main is through #20. Draft #10 motion and #7 video remain open. Real listing facts, original photos and production admin acceptance still need verification.

## Run and test

Use Node 24. From the repo root:

```sh
npm ci
npm run check
npm test
npm ci --prefix tests
# Public browser suite: serve the repo in a separate terminal.
python3 -m http.server 8787 --bind 127.0.0.1
# Then in another terminal:
OAKTOWN_BASE_URL=http://127.0.0.1:8787 npm --prefix tests run test:browser
npm run test:admin-browser
npm run test:photo-order
```

`OAKTOWN_CHROMIUM` can select an installed executable. UI changes also run the
relevant existing design/audit/slideshow suites listed in `tests/package.json`.
Use local fixtures; real production sign-in is a separate owner acceptance step.
Main pushes trigger Cloudflare auto-deployment. `.assetsignore` excludes these
handoff/docs files from static assets. No production seed, migration, publication
or provider change is needed for this documentation setup.

## Existing drafts (not an active editing claim)

- [#10 motion](https://github.com/huzshk0707/oaktown-rentals-website/pull/10):
  `design/refined-photo-motion` / `9a1b568`; compare against current main first.
- [#7 video](https://github.com/huzshk0707/oaktown-rentals-website/pull/7):
  `marketing/115-colonial-video` / `c07c58a`; original photos/selection and final
  render remain pending. Do not replace its media assignments with invented images.

## Receiving account checklist

Read current main's AGENTS/HANDOFF/TASKS, then `git log -15`, live open PRs and
branches. Choose the active task's latest branch/PR; inspect status and preserve
leftovers. Check owner/expiry before claiming and pushing your own checkpoint.
Follow that branch's exact NEXT STEP. If setup is complete and no task is claimed,
choose the first actionable unclaimed TASKS item; retain explicit review/approval
blockers instead of redoing finished work. hp/felix starts are in `docs/ai-accounts/`.
