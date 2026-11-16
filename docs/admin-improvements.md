# Leslie's property editor — implemented improvements

The owner approved implementing the admin improvement review and merging the finished change. This supersedes the proposal-only scope of the original public-site redesign. This document describes the implementation; it does not claim deployment or Leslie's usability acceptance.

## Scope

- The collection separates **On website / Draft only / Archived** from rental availability. Published cards show the published snapshot, with saved private differences beneath it. **Needs publishing** filters the outstanding work.
- Five editor sections keep everyday details, photos, description, rental terms and publication review manageable. Web address and original listing link remain under collapsed advanced settings. Save, preview and publish controls remain available while scrolling.
- Photo uploads have individual statuses, retry and dismiss actions. A failed file does not discard successful uploads. **Set as main photo** moves the chosen image to the beginning; existing drag, keyboard and Earlier/Later ordering remain available. Existing limits stay at 20 images and 8 MB per image.
- Private preview uses the public listing renderer with the current unsaved form, device width and English/Spanish selectors. It requires an authenticated admin session, receives the draft in memory and uses authenticated draft-media URLs. Drafts do not enter a public URL or public content endpoint. Preview links cannot submit applications or navigate away.
- Publication readiness links back to missing fields. A separate confirmation shows the differences from the live version before the existing save-and-publish flow. Canceling that confirmation performs no write. Unknown availability stays an explicit inquiry state rather than an invented availability claim.

The only admin-response addition is `publishedProperty`, which lets the editor compare its private draft with the actual public snapshot. Public data remains sourced from published records. Existing version-conflict protection, Cloudflare Access, D1/R2 integration, routes and publication actions remain in place. No production property records, authentication settings, secrets, migrations or deployment configuration are changed by this implementation.

## Verification

The final review should run syntax and CMS/security checks, the existing admin browser and photo-order suites, the new admin-improvement suite, and public-site regression checks. The new suite exercises live/draft separation, private unsaved bilingual previews, canceled and confirmed publication, per-file upload failure/retry, cover selection, readiness links and narrow mobile controls. All mutation tests must use the disposable local harness; do not run them against production.

Before merging, inspect desktop and mobile captures for card clarity, section navigation, sticky control clearance, photo management and preview usability. Record actual results in the pull request; these intended checks are not a claim that they have passed. Native phone/browser testing and a hands-on session with Leslie remain useful follow-up validation.

## Deferred

History viewing, property duplication, automatic HEIC conversion, photo cropping and bulk migration of existing Squarespace photographs remain separate work. The upload queue uses the existing endpoint and no additional uploader dependency; retry is a fresh request, not a resumable upload.

## Maintenance

`admin/preview.html` mirrors the public page shell and loads the same public styles and renderer. Keep that shell synchronized when changing shared public markup, script ordering or asset paths. Keep the preview bridge before `app.js`; preserve its session and parent-origin checks. Do not weaken security headers or bind branch previews to production storage to make draft preview work.

See the [editing guide](admin-phone-guide.md), [operating guide](admin-setup.md) and [original design proposal](redesign/admin-proposal.md).
