# Oaktown Signature integration

[Draft PR #29](https://github.com/huzshk0707/oaktown-rentals-website/pull/29) combines the Signature site and catalogue work on `integration/oaktown-signature` against `main`. Use the [integration preview](https://integration-oaktown-signature-oaktown.rentals10.workers.dev/#homes) for shared review.

| Source | Integrated checkpoint | Result |
| --- | --- | --- |
| PR #26, Felix | `dd40325` | Cinematic hero, Boutique gallery and Grid toggle, typography, bilingual showing links, history and review-only prototypes |
| PR #27, Felix Junior | `e50f3c4` | Review harness palette and mobile media fixes, panel keyboard/reduced-motion/Spanish and map-free filtering checks |
| PR #28, Felix Junior | `5b5c6ab` | Sloemer and Troutwood, missing-photo and unknown-term handling, 38 reviewed imports |
| PR #30, Ravi | `f5a2476` → `48a32cd` | Owner-approved Phase 2E header, navigation, hero buttons and disclosures |
| PR #25 | `9391a17` | Separate booking staging acceptance in its existing branch |

The original source merges applied cleanly. The Phase 2E merge resolved only the shared handoff log and retained both branches’ history. Initial integration reconciled stale four-listing assertions, absolute vs. relative photo URLs and empty-gallery expectations. The database test harness now seeds a separate snapshot of the four existing CMS-compatible records. The published database and the file catalogue are distinct test cases.

The available worktrees, local commits, remote branches and reflogs contained no extra Signature work to recover. Felix's earlier recovery branch `felix/signature-local-recovery` is preserved. The separate booking checkout has existing edits and was left alone. Work that exists only in another account's workspace requires a pushed recovery checkpoint from that account.

## Inventory and publication holds

The file catalogue contains Colonial, Smallboat, Cherokee #8, Madison, Sloemer and Troutwood. Its 68 gallery entries include 19 approved Colonial JPEGs, 11 reviewed Smallboat JPEGs and eight Sloemer originals. All 38 imported files match the PR #28 Git blobs. The six held Smallboat edits (03, 12, 14–17) remain excluded. Previous URLs fill the corresponding original slots. [Photo decisions and sources](../FELIX-JUNIOR-PROPERTY-EXPANSION.md).

Sloemer's rent, deposit and availability are unconfirmed. Troutwood remains contact-only with no rent, renovated specs or approved exterior. Its January 2027 wording is a draft review item. Keep the Afterglow architectural review and Smallboat source/condition/rights holds before any production approval. Zillow showing destinations remain unverified and the existing exact-property SMS fallback remains in use.

## File mode and database mode

- With no DB binding or `PUBLIC_CATALOGUE_SOURCE=file`, the Worker returns `{"mode":"file"}` and the client uses the six records in `data.js`. The checked-in preview config clears D1, R2 and Access vars.
- With D1 configured for database mode, the API returns published snapshots only. The client replaces the entire file catalogue. An empty published set or a failed configured API does not resurrect file listings.
- The existing CMS validator requires numeric terms/bed/bath and positive rent for publication, requires a captioned photo, and accepts private `/media/` references or approved Squarespace HTTPS URLs. It cannot directly ingest the new null terms or `/assets/properties/` imports. File-only display fields also require explicit model/API/editor decisions. The existing one-time seed script is not a migration for this catalogue.
- Any database transition needs approved facts, a defined upcoming/contact-only model, scoped media handling, a versioned mapping and a disposable staging rehearsal. Production CMS, schema, Access and storage were untouched.

## Verification and handoff

Run file-mode browser suites against a local static server. The admin browser suites start a disposable database and storage harness internally. Run `npm run check` and `npm test` with Node 24.

`OAKTOWN_BASE_URL=http://127.0.0.1:8942 OAKTOWN_AXE_PATH=/path/to/axe.min.js OAKTOWN_REPORT=/tmp/integration.json node tests/verify-integration.cjs` opens all six real routes, checks asset hashes and selects each of the 68 photos with normal TLS. It checks collection and two new detail routes at 320, 390, 768 and 1440px in EN/ES. [Local verification](local-verification.json) records 24 axe scans and exact asset hashes. Axe image contrast incompletes are retained.

The current suite passed on Node 24 and Chromium. Exact outputs are in [test-results](test-results).

| Checks | Result |
| --- | --- |
| Syntax and CMS/security, card and expansion unit tests | 11 tests passed |
| Public browser, design, Signature | 45, 33 and 19 checks passed |
| Collection, Boutique, browsing, audit, motion, refinement | 8, 7, 24, 15, 9 and 12 checks passed |
| Junior prototype | Desktop EN and 390px EN/ES passed |
| Admin | Disposable editor and photo-order flows plus six admin improvements passed |
| Mint Mojo and gallery playback | Both suites passed |
| File/database inventory | File override, empty-binding response and distinct published DB fixture passed. Validator blocks draft terms and static asset photo paths |
| Photos and accessibility | Six routes, all 68 real photo selections, 38 imported hashes, 24 axe scans with zero confirmed violations |

The superseded old O-portal and scroll-chapter tests describe pre-Signature behavior. Current Signature and motion suites cover the approved hero. Browser checks used Chromium including simulated touch. Native Safari/Firefox and manual assistive technology sessions were outside this run.

Cloudflare reported a successful build and deployment for checkpoint `88e4d41` on [PR #29](https://github.com/huzshk0707/oaktown-rentals-website/pull/29). Hosted byte and isolation verification requires network access to its hostname. Once available, run the same verifier with `OAKTOWN_BASE_URL=https://integration-oaktown-signature-oaktown.rentals10.workers.dev` and save the report. Hosted-only checks validate file mode, robots/noindex, admin denial and exclusion of review files.

Ravi coordinates integration and preview verification. Felix owns isolated Signature design follow-ups. Felix Junior owns isolated property/media follow-ups and evidence for open content holds. Start future website feature branches at the latest `origin/integration/oaktown-signature` and target that branch with review PRs. Preserve existing source branches and claims. The booking PR keeps its own base. Review [Bethune motion findings](../BETHUNE-MOTION-STUDY.md) and [the roadmap](../ROADMAP.md) for future creative direction.

## Phase 2E integration and Phase 3 handoff

The owner approved `f5a2476ddbb4f5595b5d6d2964235353f590c18b`. GitHub merged that exact commit into the shared branch at `48a32cdc81b4a9cafb505912a539fdce6b86ada2`. The only conflict was `HANDOFF.md`. The merge matches the approved feature tree except for that log. The previous `data.js`, 38 rental assets, Worker configuration, CMS, admin and Mint Mojo files are byte-identical. The only new site asset is the already approved transparent wordmark. All six Smallboat exclusions and the existing property, Afterglow, Zillow and migration holds remain documented. See the [Smallboat audit](../phase2e/final/SMALLBOAT-PHOTOGRAPHY.md).

Cloudflare reported a successful preview build and deployment for the merge. [Shared preview](https://integration-oaktown-signature-oaktown.rentals10.workers.dev/) · [Cloudflare build report](https://github.com/huzshk0707/oaktown-rentals-website/pull/29#issuecomment-7231796506). The workspace egress policy blocks direct testing of that hostname with CONNECT 403. The local Worker, built with the checked-in preview bindings and asset rules, served file mode and the exact header assets, returned noindex and restrictive robots, denied the admin API and excluded documentation and review media. Direct hosted asset hashes and isolation remain unverified.

### Regression evidence for `48a32cd`

Run `npm run check` and `npm test` on Node 24. Serve the integration checkout at `http://127.0.0.1:8946`. With `OAKTOWN_BASE_URL` set to that address, run `node tests/<suite>.cjs` for each named browser suite. Admin suites use disposable data. Run the catalogue verifier with `OAKTOWN_AXE_PATH` pointing to `axe.min.js` and `OAKTOWN_REPORT` to the output JSON.

| Rerun | Result |
| --- | --- |
| Syntax and unit/CMS | Syntax passed, 11 tests passed |
| Sky header, public browser, Signature, design | 27, 45, 19 and 33 checks passed |
| Refinement, motion, collection, Boutique, browsing and audit | 12, 9, 8, 7, 24 and 15 checks passed |
| Gallery playback, Mint Mojo, Junior prototypes and disposable admin | All passed |
| Real catalogue and accessibility | Six records, 38 imported-file hashes, 68 ordered selections, 24 axe scans with zero confirmed violations |
| Worker preview settings, local Wrangler | File catalogue, exact header asset bytes, robots/noindex, admin denial and review asset exclusions passed |

See [test transcripts](phase2e/test-results) and the [catalogue report](phase2e/catalogue.json). Docs and evidence were the only changes after the tested merge.

Felix owns Phase 3 — Homepage Completion. Start the feature branch from the verified shared handoff, preserve the approved opening and catalogue, and use the [Phase 3 scope](../ROADMAP.md#phase-3--homepage-completion). The combined PR remains draft. Booking PR #25 stays on its separate staging path.
