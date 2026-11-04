# Oaktown Rentals — Cinematic Website (Version 0.3)

A standalone, animated, mobile-friendly Oaktown Rentals website concept based on the *design direction* of the supplied cinematic real-estate video. Not a copy of the featured third-party website. Preserves public information from the existing Oaktown Rentals Squarespace website where practical.

## Features

- Three-chapter photo story linked to native scrolling, oversized type, and a photo-filled O transition inspired by the supplied video. Uses real property photos, not construction renders from the reference.
- Editorial photo collage, property photo counts, and a direct featured-home link retained from the main branch.
- Perspective property strip with native touch scrolling, arrow controls, keyboard navigation and neighborhood filters.
- Full-screen native-dialog galleries with Escape, arrow keys, touch swipes and image-load error messages.
- Motion toggle persists locally; reduced-motion and smaller screens use an unpinned layout. No autoplay or wheel interception.
- Self-hosted Manrope and DM Sans variable fonts; licenses included in `assets/fonts/`.
- Responsive property cards with neighborhood filtering and individual, deep-linkable gallery/detail views.
- Four properties sourced from the public Oaktown Rentals site: 115 Colonial Drive, 1106 Cherokee Rd #6, 4005 Smallboat Ct, 1106 Cherokee Rd #8.
- FAQ, Louisville community links, Cudjoe Key / The Mint Mojo feature, contact actions, online application link.
- English/Spanish toggle for main page content and listing summaries (full property detail bodies remain in English in v0.3).
- No dependencies, build system, tracking scripts or backend required; accessible reduced-motion support.

## Run locally

From this folder:

```sh
python3 -m http.server 8787
```

Visit `http://localhost:8787/`. Node/Python are only needed for local preview; deployment serves static files.

## Current Cloudflare deployment — Workers Static Assets

- Live preview: https://oaktown-rentals-website.huzaifashaikhhp.workers.dev
- GitHub repository: `huzshk0707/oaktown-rentals-website` (private); production branch: `main`.
- Cloudflare project type: **Worker with Static Assets**, automatically deployed from the connected GitHub repository. No custom domain is required.
- `wrangler.jsonc` declares the static asset directory as repository root (`.`). `.assetsignore` excludes internal files from public asset uploads.
- Changes pushed to `main` trigger a Cloudflare deployment. Check **Workers & Pages → oaktown-rentals-website → Deployments** to verify the new version is active.
- The preview intentionally has `noindex,nofollow` metadata and `robots.txt` disallow rules. Do not remove them until the content and launch are approved.

## Content and launch checklist — **important**

- **Live design preview, not approved inventory**. The main branch is accessible on Cloudflare. This scroll-driven revision is in a draft pull request; listing information still needs confirmation before public launch.
- **Colonial rent**: The public listing and preview both show **$1,799 rent and deposit**, checked November 4, 2026. Reconfirm availability with Leslie before launch.
- **1106 Cherokee #6**: Source updated to the working `/1106-cherokee-rd-6` URL, with eight unit-specific photos. Public galleries were refreshed on November 4, 2026: Colonial 14, Cherokee #6 8, Smallboat 7, Cherokee #8 10. Photo URLs remain on Squarespace.
- **4005 Smallboat timing**: Squarespace says showings after mid-October 2026; this is stale as of November 2026. Do not represent it as current availability.
- **1106 Cherokee #8**: Listed rent is $950 on the existing Squarespace website; verify it is actually being marketed before announcing availability.
- **Photos depend on Squarespace CDN**: `data.js` references Oaktown's existing public Squarespace CDN images. Before cancelling Squarespace, obtain original property images and upload/compress them into a local `assets/` folder. Replace each remote URL with `/assets/<filename>`. Do not rely on Zillow embeds or third-party hotlinks for production.
- **Metadata and search**: Preview intentionally has `robots.txt` `Disallow: /` and `<meta name="robots" content="noindex,nofollow">`. Remove these only once the website is approved for launch.
- **Spanish**: The essential UI and summaries are translated, but full details and feature labels are not yet localized.
- **Policies/fees**: The site's pre-existing FAQ and listings may conflict or be outdated. Screening criteria, pet terms, deposits and fees should be verified with Leslie and reviewed for applicable fair-housing requirements before publication.
- **Photography**: Do not substitute Unit #8 photos for Unit #6; maintain property-to-unit image mapping.
- **Accessibility**: Verify screen-reader behavior, keyboard navigation, photo alternative text and contrast during acceptance testing.
- **Community links**: These point to official local resources, rather than copying the original site's long list of older directories/phone numbers.

## Editing

- `data.js` — all property records, pricing, public photos and outbound links.
- `app.js` — routes, sections, translation copy, filters and galleries.
- `styles.css` — base styling and self-hosted font declarations.
- `cinematic.css` — story, letter transition, carousel, gallery and responsive layouts.
- `effects.js` — scroll-linked scenes, perspective effects, motion preferences and lifecycle cleanup.
- `index.html` — shell and site metadata.

## Validation

The production site has no dependencies. Browser-test dependencies are isolated under `tests/`, avoiding automatic development-package installs in Cloudflare's static Worker deployment.

```sh
node --check app.js && node --check data.js && node --check effects.js
# In a separate terminal from the repo root, run: python3 -m http.server 8787
cd tests
npm ci
npx playwright install chromium
npm run check
npm run test:browser
```

Set `OAKTOWN_BASE_URL` to test another local port, or `OAKTOWN_CHROMIUM` to use an installed Chromium executable. Tests deliberately block external requests and exercise image-failure behavior; they do not validate CDN photography. Test sources and package metadata are excluded from Worker static assets.

Behavior checks covered desktop chapter changes, the letter transition, collection scrolling and filters, gallery focus/keyboard behavior, malformed routes, mobile navigation, translated controls, and persisted/reduced motion. Layouts checked at 320, 390, 768, 1024, 1440 and 1920px. The review environment blocks the Squarespace CDN, so real-image crop/contrast and network performance still need visual acceptance testing with CDN access. No production deployment was performed during this source review.

## Original source

- Existing website: https://tuba-parsnip-36cr.squarespace.com/
- Online rental application: https://oaktownrentalsapplication.fillout.com/95

This project is **not** Oaktown Ops and must not include internal tenant information, door codes, financial accounts or other non-public operations data.