# Property admin — deployment and operating guide

The public website and `/admin/` are in the same repository and Cloudflare Worker. D1 stores property content; a private R2 bucket stores uploaded photos. Cloudflare Access handles sign-in. The Worker additionally verifies the signed Access JWT (issuer, audience, signature, expiration, app-token type and approved email) on every admin page, asset and API request. There is no local/demo sign-in bypass in the production Worker.

## Current state

On November 7, 2026, the owner enabled R2 and Access. Production configuration now connects D1 database `oaktown-properties` (`de551a7d-04b1-4db8-a673-852ac4881be5`) and private R2 bucket `oaktown-property-photos`. Migration `0001_properties.sql` and the idempotent four-listing import are applied. Uploaded photos are served only through the Worker's published-photo checks; the bucket's managed public domain is disabled and it has no public custom domains.

Cloudflare Access application `44e6199e-0402-493e-9f37-6230c57ec278` protects `/admin` and `/api/admin`, including descendants, on `oaktown.rentals10.workers.dev`, using the same audience. It uses the email one-time PIN provider and a single Allow policy containing exactly the three owner-approved accounts. The matching `ADMIN_EMAILS` Worker secret is configured; addresses are not committed here. The team domain and audience in `wrangler.jsonc` are identifiers, not credentials.

The `previews` block explicitly removes D1, R2 and Access variables from branch previews. Do not deploy branch previews with the production deployment command; use the connected preview workflow or `wrangler preview`. Ordinary `wrangler dev` now uses local simulated databases/storage and still requires verified Access tokens; there is no sign-in bypass.

Deployment configuration and resource checks are distinct from an authenticated production browser check. The current task's network policy allows the Cloudflare API but blocks the website and Access team hostnames. The owner must complete an actual email-code sign-in and live draft/upload/publish workflow, or allow those hostnames in the execution environment so browser checks can reach them. No production email-code delivery or staff session has been simulated or assumed.

Continuation validation passed: syntax checks, three backend/security tests, the admin browser workflow, 43 public-site browser checks, Mint Mojo browser checks and Wrangler deployment dry-run. Local Worker checks returned 200 for the homepage and Mint Mojo, 503 for unconfigured admin routes, and 404 for private server, configuration, documentation and test files. The remote D1 query confirmed four imported listings, zero uploaded media and the applied migration. Wrangler's file-import upload could not complete through the available network route; the same idempotent SQL was applied successfully through D1's authenticated query API instead.

## Setup reference for recovery or a new installation

1. **Reuse the staged database and create the photo bucket in the website owner's Cloudflare account.** D1 database `oaktown-properties` already exists with the ID above. After enabling R2, create bucket `oaktown-property-photos`. Keep the R2 bucket private: do not enable `r2.dev` or a public custom domain. R2 requires its own subscription checkout; included free usage is available. Do not enable a paid Workers plan merely to create the admin.
2. **Create one hostname/path-based Cloudflare Access application.** In Zero Trust → Access → Applications, add a self-hosted application covering both `<website hostname>/admin` (including descendants) and `<website hostname>/api/admin` (including descendants) with the **same application audience**. Protect exact paths and their descendants according to Cloudflare's path matching rules. Include only the three approved email accounts, use Allow (never Bypass or Everyone), and use email one-time PIN or an established identity provider. Do not protect the whole public website. Record the team domain (`your-team.cloudflareaccess.com`) and application audience tag. Cover every hostname or alias that will be used for admin sign-in; requests on unprotected aliases still fail the Worker's JWT verification.
3. **Configure the Worker.** Merge the `d1_databases`, `r2_buckets` and `vars` entries from `wrangler.cms.example.jsonc` into `wrangler.jsonc`, replacing the database ID and Access placeholders with the actual values. Use the Cloudflare dashboard's encrypted secret setting for `ADMIN_EMAILS` (comma-separated approved accounts), or run `npx wrangler secret put ADMIN_EMAILS` in an authenticated terminal. This must match the Access policy's allowed accounts. Do not put the allowlist into `admin.js` or public `data.js`.
4. **Verify initialization and import before switching the public site to D1.** The staged database already has migration `0001_properties.sql` and four source listings. For a fresh replacement database, or an idempotent setup check, use an authenticated terminal:

   ```sh
   npm ci
   npx wrangler d1 migrations apply oaktown-properties --remote
   npm run seed
   npx wrangler d1 execute oaktown-properties --remote --file .wrangler/import-properties.sql
   ```

   The import is explicit and idempotent: it inserts the four source listings without overwriting existing property IDs. Their availability remains “Confirm with us.” Existing photo links still point to Squarespace. Upload replacements in the admin to migrate images gradually; no remote image downloader is exposed in the Worker.
5. **Deploy and verify.** Use the connected GitHub deployment or `npm run deploy` once bindings and Access are ready. Confirm unauthorized accounts cannot open `/admin/` or read `/api/admin/properties`; authorized accounts can sign in, save a draft and preview it. Confirm a draft-only change does not affect `/api/properties`, and publishing updates the site. Test a photo upload, archive and republish using a test listing. Check Cloudflare usage after setup. Delete or archive the test listing when finished.

Cloudflare's current Workers configuration supports Access protection of a `workers.dev` hostname or a specific path; a purchased domain is not required for this first version. [Access setup](https://developers.cloudflare.com/workers/configuration/cloudflare-access/).

## Preview and development isolation

Keep preview builds unbound or attach separate test databases/buckets. Do not bind PR previews to production D1 or R2: an authenticated user could otherwise edit production content through a preview. Preview Access audience and hostnames must also be configured independently.

For an unconfigured Worker, public content uses file mode and admin routes stay closed. With the production configuration, `npm run dev` uses a separate local D1 database: apply migrations and seed that local database before testing inventory; remote data is not copied automatically. `npm test` exercises real SQLite statements and JWT fixtures. `npm --prefix tests ci`, then `npm run test:admin-browser`, runs a local test-only server with sample content and an injected test identity. That fixture identity exists only in `tests/`, which is excluded from static assets and is not imported by the production Worker. No `.dev.vars` flag can turn off authentication.

## Daily use

See the [phone and computer editing guide](admin-phone-guide.md) for the sign-in and editing steps.

- Add a property, save a draft, upload photos and describe each one. The first photo is the main image. Reorder photos with Earlier/Later.
- Edit English and optionally Spanish content. Empty Spanish fields use English content.
- Save draft leaves a published snapshot unchanged. Preview shows the current form. Publish validates required content and replaces the public snapshot.
- Archive removes the listing from public results and public photo access, while retaining its editable content. Edit and publish it to restore it. Unpublish keeps a private draft. There is no irreversible property-delete action in this first version.
- A stale browser tab receives a conflict message instead of overwriting another editor's work. Reload the property before trying again.

Uploads accept JPG, PNG and WebP, checked by file signatures, at most 8 MB each and 20 photos per property. SVG/HTML are rejected. Draft uploads are private; only photos referenced by currently published listings have public media URLs. Public photos may remain in browser caches for up to 60 seconds after archiving. Removing a photo from a form removes it from the next published listing; unused uploaded objects are retained privately. A future cleanup action can reclaim orphaned storage after a retention period. The current activity table records who saved, uploaded, published or archived, but the initial UI does not yet provide a history browser.

Back up D1 and R2 before bulk imports or migrations. Cloudflare D1 Time Travel can help recover database changes; it does not back up R2 photos. Monitor the private retained-upload storage when evaluating R2 usage.

## Hosting costs checked November 5, 2026

| Component | Included free allowance |
| --- | --- |
| Static website and admin assets | Free, unlimited static-asset requests |
| Worker (site/admin/API routing) | 100,000 requests/day on Workers Free, subject to CPU limits |
| D1 | 5 GB total, 5 million rows read/day, 100,000 rows written/day |
| R2 Standard | 10 GB-month storage, 1 million Class A and 10 million Class B operations/month; no egress charge |
| Access | Free plan supports up to 50 users |

A small rental portfolio is likely to remain within these allowances, but $0 is an estimate, not a permanent guarantee. All requests run through the Worker before asset routing so encoded URL aliases cannot skip admin authorization; those Worker invocations count toward the request allowance even though static-asset serving itself is free. R2 requires a subscription checkout and bills usage above its allowance. Workers Paid starts at $5/month if an upgrade becomes necessary; photo storage and other excess usage are separate. A custom domain is optional and has its own registration cost. The staged D1 database uses the existing plan; no paid subscription has been enabled by this change.

Sources: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [R2 setup](https://developers.cloudflare.com/r2/get-started/), [Access plans](https://www.cloudflare.com/plans/).
