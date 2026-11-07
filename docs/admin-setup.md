# Property admin — deployment and operating guide

The public website and `/admin/` are in the same repository and Cloudflare Worker. D1 stores property content; a private R2 bucket stores uploaded photos. Cloudflare Access handles sign-in. The Worker additionally verifies the signed Access JWT (issuer, audience, signature, expiration, app-token type and approved email) on every admin page, asset and API request. There is no local/demo sign-in bypass in the production Worker.

## Current state

The implementation and local tests are ready. Production D1, R2 and Access have **not** been provisioned from this environment: no Cloudflare account credentials are available here. Default `wrangler.jsonc` has no database or Access identity configuration. It serves the existing file-based listings and closes all admin routes until configured. An empty configured database is authoritative: it shows no homes, rather than bringing old listings back. A database outage shows an inventory-unavailable message.

The owner's three approved accounts are recorded in an ignored local `.dev.vars` file, not in the repository or browser assets. Add that allowlist to the Worker's `ADMIN_EMAILS` secret in Cloudflare as part of the setup below. Never paste Cloudflare API tokens into chat or commit credentials.

### A saved environment credential is not reaching this task

Store `CLOUDFLARE_API_TOKEN` as a secure environment credential scoped to `api.cloudflare.com`, and allow that destination in the environment's network settings. A token saved only in a vault must also be bound to the selected environment. Publishing an updated reusable environment does not necessarily update an existing task: select the published configuration when starting the continuation task. Verify that the running environment reports the credential as ready before provisioning anything. The Cloudflare account ID is already known from this website's deployment; the owner does not need to send it again.

As checked November 7, 2026, the task's attached environment still reports no secret bindings and no custom allowed hosts. This is an environment attachment/configuration blocker; it is not a failed Cloudflare token validation. The token has not been sent to Cloudflare from this session.

## One-time production setup

1. **Create the database and photo bucket in the website owner's Cloudflare account.** Use D1 database `oaktown-properties` and R2 bucket `oaktown-property-photos`. Keep the R2 bucket private: do not enable `r2.dev` or a public custom domain. R2 requires its own subscription checkout; included free usage is available. Do not enable a paid Workers plan merely to create the admin.
2. **Create one hostname/path-based Cloudflare Access application.** In Zero Trust → Access → Applications, add a self-hosted application covering both `<website hostname>/admin` (including descendants) and `<website hostname>/api/admin` (including descendants) with the **same application audience**. Protect exact paths and their descendants according to Cloudflare's path matching rules. Include only the three approved email accounts, use Allow (never Bypass or Everyone), and use email one-time PIN or an established identity provider. Do not protect the whole public website. Record the team domain (`your-team.cloudflareaccess.com`) and application audience tag. Cover every hostname or alias that will be used for admin sign-in; requests on unprotected aliases still fail the Worker's JWT verification.
3. **Configure the Worker.** Merge the `d1_databases`, `r2_buckets` and `vars` entries from `wrangler.cms.example.jsonc` into `wrangler.jsonc`, replacing the database ID and Access placeholders with the actual values. Use the Cloudflare dashboard's encrypted secret setting for `ADMIN_EMAILS` (comma-separated approved accounts), or run `npx wrangler secret put ADMIN_EMAILS` in an authenticated terminal. This must match the Access policy's allowed accounts. Do not put the allowlist into `admin.js` or public `data.js`.
4. **Initialize and import before switching the public site to D1.** From an authenticated terminal:

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

For an unconfigured local Worker, `npm run dev` serves file-based public content and closed admin routes. `npm test` exercises real SQLite statements and JWT fixtures. `npm --prefix tests ci`, then `npm run test:admin-browser`, runs a local test-only server with sample content and an injected test identity. That fixture identity exists only in `tests/`, which is excluded from static assets and is not imported by the production Worker. No `.dev.vars` flag can turn off authentication.

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

A small rental portfolio is likely to remain within these allowances, but $0 is an estimate, not a permanent guarantee. All requests run through the Worker before asset routing so encoded URL aliases cannot skip admin authorization; those Worker invocations count toward the request allowance even though static-asset serving itself is free. R2 requires a subscription checkout and bills usage above its allowance. Workers Paid starts at $5/month if an upgrade becomes necessary; photo storage and other excess usage are separate. A custom domain is optional and has its own registration cost. This change does not enable a paid subscription or provision remote resources.

Sources: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [R2 setup](https://developers.cloudflare.com/r2/get-started/), [Access plans](https://www.cloudflare.com/plans/).
