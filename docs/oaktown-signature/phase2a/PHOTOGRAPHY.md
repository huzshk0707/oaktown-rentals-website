# Photography audit — Phase 2A

## Identity and coverage

[Machine-readable manifest](catalogue-audit.json) enumerates **all 60 exact original URLs** in gallery order, property slug, image key and main-photo role. There are no duplicate URLs across the four galleries. Their assignments are inherited unchanged from the merged listing refresh and current `data.js`; this audit does not newly visually authenticate remote bytes. Colonial 19, Smallboat 17, Cherokee **#8** 9, Madison 15. Afterglow hero assets and Lobster Nirvana's independent photography are outside this collection inventory and unchanged.

Do not remap Madison photos based on misleading legacy filenames such as Colonial Drive. Confirm against the exact owner/listing mapping, not filenames or architectural guesses. Do not restore Cherokee #6 or substitute #8 photographs for another unit. Current source page links are included per property in the manifest.

## Network findings and limits

On 27 November 2026, normal workspace-proxy requests to the first Colonial image (500w) and the hosted preview failed **before reaching the origin**: proxy CONNECT HTTP 403 / curl 56 / origin status 000. This establishes a development-environment access limitation; it does **not** establish an outage at Squarespace or prove photos work on the hosted preview. No proxy, allowlist, TLS or production setting was changed. Hosted photo verification remains open.

Actual Chromium requests, without substituted photography, are recorded in [browser-comparison.json](browser-comparison.json). Screenshot names explicitly identify CDN-unavailable captures. Those captures verify layout/error behavior only, never final photographic appearance. Felix's prior successful preview build/runtime verification proves deployment of that checkpoint, not successful loading of all external galleries.

Original dimensions, aspect ratios, sharpness, exposure, crop quality, transfer sizes and cold-cache latency **cannot be verified without successfully loading original image bytes**. They are null/unverified in the manifest, not guessed from filenames or requested `format` widths. Before creative selection, inspect every original, record natural dimensions/hash/bytes and approve main-image crops at desktop and mobile. No image enhancement was performed here.

## Existing loading and fallback behavior

- Gallery main photo is the first URL. Hover photo previews and detail/gallery navigation retain exact gallery order.
- Squarespace image requests use responsive widths (500/1000/1500/2500); thumbnails 100/300/500. `loading=lazy`, async decode and `sizes=auto` let modern browsers use actual card width. Detail cover is eager/high priority. No additional preloading of all 60 images.
- Only the exact HTTPS Squarespace CDN hostname is eligible for URL resizing. Local `/media/` and protected `/api/admin/media/` paths remain unchanged. A lookalike hostname or URL containing the CDN name in a query is not rewritten.
- Existing source-size fallbacks are conservative; the horizontal-gallery implementation updates the card fallback to its fixed responsive width. Requested rendition size is not proof that the original is that large.
- Existing image error listener adds `image-unavailable`; CSS displays the localized unavailable message. The reusable card also uses this fallback for an absent/empty gallery, preserving the detail link. No stock/AI/wrong-house fallback.
- CMS alt text is retained. File-gallery fallback is address + photo number; descriptive EN/ES alts need actual visual review, not invented room labels. The hero's enhanced-photo architectural acceptance is still a separate gate.

## Safe future reduction of external dependency — not executed

1. Obtain approved original files and reuse rights for each exact property/unit. Cross-check every URL/order against owner-approved listings, retaining ambiguous filenames for traceability.
2. Download through an authorized network; hash originals, record dimensions/MIME/bytes and inspect quality. Build a per-property mapping manifest. Do not bulk overwrite the live gallery.
3. Produce non-generative responsive derivatives with approved crops/quality; retain originals. Choose repository assets for fixed public photography or the existing private R2/CMS upload path for managed inventory. Do not expose unpublished media.
4. Rehearse on a branch/disposable CMS, preserving slug, order, alt text and private/public authorization. Compare bytes, render quality, bandwidth and all gallery interactions with the owner.
5. Obtain separate approval for destination, migration diff, production publication and rollback. Keep the old manifest/URLs until rollback and cache behavior are verified. No live asset copy, R2 mutation or schema migration is authorized by this audit.

**Exact remaining photo check:** open the PR preview from a CDN-enabled browser, visit all four detail routes, load every thumbnail/full photo, and save natural dimensions, failed requests and original-quality screenshots. If hosted requests fail too, capture their actual HTTP/CSP error before proposing a fix.
