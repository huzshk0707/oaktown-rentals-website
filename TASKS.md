# Tasks — Oaktown Rentals Website

Prioritized from main code, README launch checklist and current PRs on 2026-11-16.
No open GitHub issues were returned at this inspection. Product priorities are
provisional; do not guess facts or treat this list as publication permission.

## P0 — reliable shared continuation

- [ ] **WEB-HANDOFF:** Install shared protocol, account prompts and PR template;
  run checks, publish documentation to main, verify remote refs and release
  ravi's claim. Current branch `ravi/shared-handoff`.

## P1 — verified content and access before launch

- [ ] **WEB-CONTENT:** Obtain current rent/availability and approved deposit,
  screening/pet policies from the owner/source. Resolve stale Smallboat timing
  and Cherokee marketing status. Keep preview/noindex restrictions in place.
- [ ] **WEB-ADMIN-ACCEPTANCE:** Complete actual authorized email-code sign-in and
  draft/upload/preview/publish-isolation acceptance using owner-approved test
  data. Local fixtures do not prove production Access sign-in. See
  [admin setup](docs/admin-setup.md); do not change allowlists or production data
  merely to run an automated test.
- [ ] **WEB-PHOTOS:** Collect verified original property/unit photos, retain exact
  unit mapping and rights, and plan migration off Squarespace CDN before that
  service is canceled. Never substitute another unit's images.

## P2 — existing PRs and bounded operational improvements

- [ ] **WEB-MOTION-REVIEW:** Evaluate draft
  [#10](https://github.com/huzshk0707/oaktown-rentals-website/pull/10),
  `design/refined-photo-motion` at `9a1b568`, against latest main. It predates
  merged visual refinements; identify retained ideas or superseded changes before
  any integration. Do not replay its older layout over current main or merge it
  without a task-specific instruction.
- [ ] **WEB-VIDEO:** Continue draft
  [#7](https://github.com/huzshk0707/oaktown-rentals-website/pull/7),
  `marketing/115-colonial-video` at `c07c58a`. Storyboard/source manifest/render
  script already exist. Obtain/review original photos, confirm format, assign
  scenes, render the complete video and review it. The smoke video is not a
  property video; no guessed rent/availability or automatic posting.
- [ ] **WEB-BROWSER-ACCEPTANCE:** Check native Safari/Firefox and uncached image
  performance with real CDN access; verify image crops, bilingual copy, keyboard
  behavior and image-backed contrast. Keep reduced motion and current galleries.
- [ ] **WEB-MEDIA-RETENTION:** Decide private orphan-upload cleanup, retention,
  backup/restore and usage monitoring for R2 alongside D1 recovery. Do not delete
  unreferenced photos without an approved retention/recovery policy.
- [ ] **WEB-AUDIT-UI:** Scope an admin history browser over existing activity
  evidence, without replacing the current authorization or property model.

## Already completed — do not restart

- [x] Main through [#20](https://github.com/huzshk0707/oaktown-rentals-website/pull/20)
  (`bb5d9ce`): original logo, single Louisville city image, desktop property
  slideshow, lighter hero tint and full city-photo story background.
- [x] Private Access-protected CMS, draft/publish separation, local security and
  browser tests, photo drag/drop ordering, bilingual public website and Mint Mojo.
- [x] PR #7's resumable video scaffolding and PR #10's review implementation are
  preserved on their existing branches. Neither is a merged/approved deliverable.

See [HANDOFF.md](HANDOFF.md), [README launch checklist](README.md) and
[latest visual review](docs/photo-backgrounds/README.md). Claim a small task before
editing; keep active owner/branch/PR and exact next action in its handoff and PR.
