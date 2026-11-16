# Handoff

- Last updated: 2026-11-16 00:49 UTC by ravi
- Current task / branch / PR: WEB-HANDOFF — shared AI continuation setup / `ravi/shared-handoff` / [PR #21](https://github.com/huzshk0707/oaktown-rentals-website/pull/21) (draft).
- Active owner: ravi; claim valid until 2026-11-16 01:19 UTC. Renew at each checkpoint; 30-minute cooperative lease.
- Last verified pushed checkpoint before this update: `c6c1f1c48eb40310f464e3362e02d9712fa4e682`; live branch/PR identifies newer checkpoints.
- Done so far: inspected latest main `bb5d9ce69bf26c33290c14158a6473f9b9806c2c`, `git log -15`, README/source, all open PRs/issues and remote branches; added permanent rules, repo-specific backlog, account starts and PR template. No existing feature branch changed.
- In progress (files being edited): `AGENTS.md`, `HANDOFF.md`, `TASKS.md`, `docs/ai-accounts/hp.md`, `docs/ai-accounts/felix.md`, `.github/PULL_REQUEST_TEMPLATE.md`, README links. Tests and main publication are not finished.
- NEXT STEP (exact and specific): run the existing check commands below and relative Markdown-link validation; record results, finish this documentation-only PR and verify the normal main push if unprotected.
- Known bugs / blockers: no setup blocker. Never-pushed edits cannot be recovered by another account. Checkpoint every 15–20 minutes and after meaningful steps. This protocol does not supply missing GitHub/provider permissions.
- How to run and test: see commands below. No product runtime change is part of this task; use local/disposable test data only.
- Decisions made and why: use Git commits plus branch handoffs and live PR logs as portable shared memory; preserve existing project rules; keep account identity separate from actual staff attribution. Main landing notes index parallel PRs instead of pretending all accounts share one checkout.

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
