# Oaktown Rentals — Cinematic Website (Version 0.2)

A standalone, animated, mobile-friendly Oaktown Rentals website concept based on the *design direction* of the supplied cinematic real-estate video. Not a copy of the featured third-party website. Preserves public information from the existing Oaktown Rentals Squarespace website where practical.

## Version 0.2 — Cinematic visual upgrade (2026-11-04)

- Three-scene featured-home hero with smooth crossfades, direct property links, accessible manual navigation, and autoplay pause.
- Editorial photo collage and typographic chapter divider inspired by the pacing of the supplied reference video.
- Refined property cards with gallery/photo counts, index labels and understated hover effects.
- Full-screen property photo viewer, arrow-key navigation, image counters, accessible dialog close behavior.
- Improved mobile layouts and a directly accessible rental application link in mobile navigation.
- Supports `prefers-reduced-motion` without forcing autoplay; the current published website remains a *preview* until listing information is confirmed.

## Features

- Cinematic, full-bleed image hero, oversized editorial typography, smooth scroll reveals, immersive photo sections.
- Responsive property cards with neighborhood filtering and individual, deep-linkable gallery/detail views.
- Four properties sourced from the public Oaktown Rentals site: 115 Colonial Drive, 1106 Cherokee Rd #6, 4005 Smallboat Ct, 1106 Cherokee Rd #8.
- FAQ, Louisville community links, Cudjoe Key / The Mint Mojo feature, contact actions, online application link.
- English/Spanish toggle for main page content and listing summaries (full property detail bodies remain in English in v0.1).
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

- **Live design preview, not approved inventory**. The site is accessible on Cloudflare, but all property availability and application policies need client confirmation before an approved public launch.
- **Colonial rent discrepancy**: The existing Squarespace website currently says `$1,850`, while a more recent client confirmation specifies **$1,799**. Preview uses `$1,799`; verify deposit/current rent with Leslie.
- **1106 Cherokee #6 Squarespace broken link**: the current navigation points to `/1119-ireland-drive-copy-1`, which returned 404. The preview restores a working dedicated detail view, but only one public image was located.
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
- `styles.css` — cinematic design, responsiveness and motion.
- `index.html` — shell and site metadata.

## Original source

- Existing website: https://tuba-parsnip-36cr.squarespace.com/
- Online rental application: https://oaktownrentalsapplication.fillout.com/95

This project is **not** Oaktown Ops and must not include internal tenant information, door codes, financial accounts or other non-public operations data.