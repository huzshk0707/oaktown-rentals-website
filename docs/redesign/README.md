# Oaktown public redesign — review draft

This branch improves the existing public site. It is **not deployed or merged**. Actual property-photo crop/quality review and opening the GitHub pull request remain dependent on environment network access.

## Current-site audit

The pre-change baseline is `9af551f`, the restored production design. Local before screenshots use its unchanged code and fallback public records; they are not production screenshots.

**Keep:** original logo and green identity; bilingual property descriptions; complete unit-specific galleries; grid/gallery choice and neighborhood filters; address-specific inquiry/showing links; the existing application URL; CMS-published snapshots, failure handling and private admin boundary. The buildless frontend and local fonts are a good fit for fast delivery.

**Improve:** the 180svh desktop hero postpones browsing and changes content as people scroll; oversized type mixes sans and isolated italic words; nearly every section competes in dark green; photo-overlay titles depend on image contrast; repeated numbered section labels add visual noise. Mobile actions need careful clearance and cards need legible facts rather than decorative treatments. Existing source CSS has accumulated several overriding layers, which should be consolidated separately if the design is accepted, with Mint Mojo regression coverage.

## Implemented direction

A warm, quiet property catalogue with Oaktown green, original photography and original logo. Complete Georgia headings pair with existing self-hosted DM Sans. The hero has stable copy and explicit photo controls, and the collection starts much sooner. Flat photo-led cards separate neighborhood, address, summary, rent and inquiry. Property pages put a clear heading and rental facts before the full-image gallery. FAQ, local resources and contact sections have distinct roles and comfortable reading sizes.

No stock photography, testimonials, metrics, inventory claims or new property facts were introduced. Hero marketing copy was lightly shortened in both languages; property descriptions and records were not edited. A no-JavaScript bilingual contact fallback was added.

[Design system](../../DESIGN.md) · [Resource evaluation](research.md) · [Leslie’s admin proposal](admin-proposal.md) · [Validation and limitations](validation.md)

## Before / after

These captures deliberately block external requests so that image-failure behavior is reproducible. **Blank labelled property-photo areas are network failure states, not proposed artwork.** Local Mint Mojo photography is included. Re-capture with the real CDN before approving photography or treating these as final visual acceptance.

| View | Before | After |
| --- | --- | --- |
| Desktop, 1440 × 1000 | [Before](screenshots/before-desktop.png) | [After](screenshots/after-desktop.png) |
| Mobile, 390 × 844 | [Before](screenshots/before-mobile.png) | [After](screenshots/after-mobile.png) |
| Desktop, full page | [Before](screenshots/before-desktop-full.png) | [After](screenshots/after-desktop-full.png) |
| Mobile, full page | [Before](screenshots/before-mobile-full.png) | [After](screenshots/after-mobile-full.png) |
| Desktop listing | [Before](screenshots/before-desktop-listing.png) | [After](screenshots/after-desktop-listing.png) |
| Mobile listing | [Before](screenshots/before-mobile-listing.png) | [After](screenshots/after-mobile-listing.png) |

### Desktop after

![Desktop redesign with external-photo failure state](screenshots/after-desktop.png)

### Mobile after

![Mobile redesign with external-photo failure state](screenshots/after-mobile.png)

## Scope and review

Public edits are `index.html`, `app.js`, `effects.js` and scoped rules in the existing `brand.css`. Tests and review documents accompany them. `/admin/`, `cms/`, `cms-client.js`, `data.js`, migrations, original media, Workers bindings, Access settings, secrets and deployment configuration are unchanged. Mint Mojo retains its existing styling because the new rules require the public catalogue's body class.

The intended PR targets `main` from `design/premium-oaktown`. Merging and production deployment require owner approval. If API access remains blocked, the branch comparison is a review aid, **not an opened pull request**.
