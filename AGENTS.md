# Working on Oaktown Rentals Website

## Shared AI handoff rules — ravi, hp and felix

These are permanent working rules for every AI account. The account names are
coordination labels, not GitHub credentials or operational staff identities.
Keep all existing project/security rules below. Current user instructions govern
scope, approval, draft-only work, merging and deployment.

1. **Start every session** by reading `AGENTS.md`, `HANDOFF.md`, `TASKS.md` and
   `git log -15`. Fetch current refs, inspect `git status --short --branch`,
   `git worktree list`, open PRs and remote branches. Continue the exact **NEXT
   STEP** in the active task's handoff; do not restart finished work. Use current
   GitHub state rather than assuming a dated status report is still current.
2. **One branch per task**, named `<account>/<short-task>` (for example
   `hp/source-review`). Open a **DRAFT PR immediately** after the first small
   checkpoint; include the owner, scope, base and precise next action. Split big
   tasks into numbered steps in `TASKS.md`. Existing branches keep their names.
3. **One account per branch.** The branch's `HANDOFF.md` and PR description record
   its owner and UTC heartbeat/claim expiry. Refresh the claim at each checkpoint,
   at least every 15–20 minutes, including while waiting on long checks. A claim
   lasts 30 minutes. Before editing, confirm the remote owner, unexpired claim and
   latest tip still match. Work on a separate task while another claim is active.
4. **Take over safely.** Explicit user reassignment, owner release, or an expired
   claim permits a takeover after checking recent PR/commit activity. Fetch and
   check out the latest branch in its existing clean worktree or a separate one.
   Run `git status`; inspect and commit recoverable leftover task changes FIRST,
   with a WIP note explaining unfinished files. Never blindly stage secrets,
   unrelated work or another active account's edits. Do not reset/clean/stash
   away unknown changes. Preserve existing branches and worktrees.
5. Publish an ownership-only checkpoint before implementation: record your account,
   UTC time, 30-minute expiry and exact NEXT STEP in `HANDOFF.md`, then commit and
   **normal-push** it and update the PR log. If the remote tip changed or the push
   is rejected, stop, fetch and reread ownership; never force-push or blindly
   rebase over a competing claim. The first accepted claim wins. A previous owner
   returning after expiry must reread the claim and stop if someone took over.
   This is a cooperative Git protocol, not a server-enforced security lock.
6. **Checkpoint continuously.** WIP commit and push about every 15–20 minutes
   (20 minutes maximum), after every meaningful step, and before long/risky work
   or ending a turn. Keep changes small; WIP commits may be incomplete. Add the
   handoff note in the same commit. Verify the remote branch contains the pushed
   commit. Do not leave completed or deliberately checkpointed work unpushed.
   A failed push is a visible blocker, never reported as saved remotely.
7. **Keep the PR description as a running log:** done / in progress / next
   checklist; owner and claim; key decisions; exact tests/commands and outcomes;
   latest pushed checkpoint; and the exact NEXT STEP, including file/command.
   Use `.github/PULL_REQUEST_TEMPLATE.md`. Update `HANDOFF.md` after every
   milestone, not just at the end; assume a quota cutoff can arrive at any time.
8. **Leave a recoverable state.** Never leave half-written files without a
   committed note identifying the file, stopping point, last stable commit and
   expected broken checks. Prefer complete small edits or a plan checkpoint
   before a large edit. Store durable review evidence in the repo/PR; links to
   one account's local `/workspace` alone cannot support another account.
9. **Preserve others' work.** Do not delete or rewrite another account's branches.
   Do not force-push, including `--force-with-lease`. Never amend already pushed
   commits; use a follow-up commit. Do not merge unrelated PRs, deploy, change
   credentials/permissions or execute operational actions merely to hand off.
10. **Finish explicitly.** Run the relevant tests, record exact results, update
    `TASKS.md` and `HANDOFF.md`, commit/push and mark the task PR ready when done.
    Preserve a user's explicit instruction to keep a particular PR draft.
    Ready is not merge approval. Release the claim and record the next bounded
    task or blocker. This setup's main push is authorized for handoff documents
    only; it does not authorize merging existing feature PRs.

### Shared Signature integration

The consolidated release candidate is draft PR #29. Use the shared branch for Signature follow-ups until publication approval and the main merge. After that merge and production verification, branch new work from main.

Ravi coordinates `integration/oaktown-signature` and its combined draft PR #29.
Ravi, Felix and Felix Junior fetch that branch and start isolated feature
branches from its latest reviewed tip. Target feature PRs back to integration.
Ravi verifies each reviewed integration and updates the shared handoff. Preserve
the existing source branches and local worktrees. Booking PR #25 keeps its
separate base and staging acceptance. See [the integration report](docs/oaktown-signature/integration/README.md).

Felix owns Phase 3 — Homepage Completion. Start that work on an isolated
feature branch from the Phase 2E handoff at the verified shared tip. Target
`integration/oaktown-signature` for review and carry forward the accepted Phase
2E opening and existing publication holds. See [the current handoff](HANDOFF.md).

### Where to resume

- `main`'s `HANDOFF.md` is the repository landing snapshot and `TASKS.md` is the
  priority index. Each active task branch owns its detailed handoff; live open
  PR descriptions are the shared registry of parallel work. Do not concurrently
  edit main's handoff from several task branches as though it were a global lock.
- An older branch may predate these files. Read the canonical shared rules with
  `git show origin/main:AGENTS.md`, `git show origin/main:HANDOFF.md` and
  `git show origin/main:TASKS.md`; then read that branch's PR/log and handoff if
  present. No unrelated merge into an existing review PR is required merely to
  read the protocol. For takeover, add its own checkpoint without renaming it.
- Handoff checklist: branch/base/PR; owner/expiry; last pushed commit; changed
  files and unfinished point; checks and exact commands; decisions and limits;
  **one exact NEXT STEP**. Never put private customer data, tokens or passwords
  in these notes. Other accounts need their own authorized GitHub/tool access.
- Only pushed commits and PR notes survive an account/environment loss. These
  instructions are not a background autosaver and cannot recover never-pushed
  edits. Frequent checkpoints bound that loss; do not promise zero-loss recovery.
- Ready-to-copy account starts: [hp](docs/ai-accounts/hp.md) and
  [felix](docs/ai-accounts/felix.md). Both follow this same protocol.

## Project rules

- This is the public rental website, not Oaktown Ops. Never put internal tenant
  details, door codes, private financial records or account allowlists here.
- Start project work with `README.md`, `docs/admin-setup.md` and the current
  source/PR evidence. Preserve the original logo, exact property/unit photos,
  English/Spanish copy, gallery routes, motion preference and accessibility.
- Public UI is buildless HTML/CSS/JS; `app.js`, `effects.js`, `data.js`,
  `cms-client.js` and `mint-mojo/` serve it. Keep models separate from rendering.
- `cms/worker.mjs` / `cms/auth.mjs` own signed Cloudflare Access authorization.
  D1 holds draft/published snapshots; private R2 holds uploads. Preserve version
  checks, draft/publish separation, audit attribution and private-photo checks.
  Never add a production auth bypass or put provider secrets into browser code.
- `.assetsignore` is an allowlist: server code, tests, handoffs and docs stay out
  of deployed static assets. Preview builds must not bind production D1/R2.
- `main` is connected to automatic Cloudflare deployment. A push there can
  deploy; a feature branch, dry-run or passing local test does not prove a live
  publication or an authenticated production sign-in.
- Keep noindex/robots preview restrictions until launch/content are explicitly
  approved. Do not guess rent, availability, deposit/pet policies or photo rights.
- Do not rerun production seeds/migrations, upload, publish or change Access
  settings just to test. Use local fixture identities and disposable data.
- Use Node 24 for checks: `npm ci`, `npm run check`, `npm test`. Browser tooling
  is in `tests/`; use `npm ci --prefix tests` and README's local browser commands.
  UI changes also need the relevant existing design/a11y/admin/gallery tests.
- Read current source before assuming an old design PR still applies. Open PR
  #10 predates merged photo/slideshow changes; PR #7's marketing video is not a
  finished property video. Do not silently overwrite or republish either.
