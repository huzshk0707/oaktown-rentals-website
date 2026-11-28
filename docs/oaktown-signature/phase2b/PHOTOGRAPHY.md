# Hosted photography verification — 27 November 2026

**All 60 originals loaded successfully in the hosted preview browser. All 60 detail selections displayed the expected photo in the original gallery order.** The preview and source CDN returned HTTP 200. Seven served runtime files matched this branch byte-for-byte. The latest recovered checkpoint was Ravi `877d196`, whose Cloudflare build passed before the read-only review.

- [Every original URL, HTTP result, SHA-256, byte count, dimensions, aspect ratio and detail-selection result](photo-verification.json).
- [Source listing identity and ordering comparison](source-listing-verification.json).
- [Original gallery contact sheets](#visual-quality-review).

## Network diagnosis

The currently selected environment reports unrestricted/enforced network access. Normal `curl`, with the inherited proxy and CA trust and TLS verification enabled, successfully fetched the preview and first original. Ravi's earlier CONNECT 403 / `ERR_TUNNEL_CONNECTION_FAILED` is an environment-specific historical result, not a current hosted-site failure.

Chromium initially reported `ERR_CERT_AUTHORITY_INVALID`. The platform-provided environment CA was imported into the Cloud browser's NSS store using `certutil`; the read-only browser audit then ran with approved access to that store. Certificate validation remained enabled. No `ignoreHTTPSErrors`, request interception, substituted photos, proxy changes, domain grants or production infrastructure changes were used. This local browser trust/setup issue is distinct from the external website's behavior.

## Exact property and unit mapping

| Property | Originals | Ordered detail selections | Source listing match | Main-image dimensions |
| --- | ---: | ---: | --- | --- |
| 115 Colonial Drive | 19/19 | 19/19 | All 19 in the same source order | 960 × 677 |
| 4005 Smallboat Ct | 17/17 | 17/17 | All 17 in the same source order | 640 × 480 |
| 1106 Cherokee Rd **#8** | 9/9 | 9/9 | All 9 on the #8 source page | 480 × 640 |
| 1824 W Madison | 15/15 | 15/15 | All 15 on the Madison source page | 1701 × 924 |

The served `data.js` SHA-256 matches Ravi's catalogue manifest. Every array of original URLs exactly equals `catalogue-audit.json`, and every thumbnail array and selected full image matches that order. Source listing titles also match the four addresses/units. Madison's `%2B` encoding was normalized to literal `+` when comparing source HTML; no URLs were changed. Legacy Madison filenames containing “Colonial Drive” remain mapped to Madison, as confirmed by its source page. Cherokee #6 was not introduced.

This verifies the supplied catalogue against its published source and visible photo sets. It is not independent onsite verification, a certification that source photos were never edited, or renewed confirmation of rental availability. Existing facts/statuses were not changed.

## Visual quality review

All 60 originals were decoded, rendered in the detail gallery and visually reviewed in contact sheets. Original downloads total **12,016,837 bytes**. They remain temporary audit inputs outside the deployable website; no asset migration was performed. Contact sheets are downsampled, non-generative review artifacts. Original hashes/dimensions are retained in the report.

| Set | Review observations | Follow-up for visual acceptance |
| --- | --- | --- |
| [Colonial, 19 photos](contact-115-colonial-drive.jpg) | Clear white exterior with lawn/garage context. Most interiors are 480 × 640 with mixed exposure and window highlights. Seventeen images have width ≤640px. | The lead works at the current desktop crop. Obtain higher-resolution interiors before expecting crisp large/retina presentation. |
| [Smallboat, 17 photos](contact-4005-smallboat-ct.jpg) | Brick exterior is dark and low resolution. Interiors mix dim/bright exposure and varied framing. All 17 have width ≤640px. Existing watermark is retained where present. | Keep the correct photos. Request better originals or separately approve non-generative corrections; do not reduce card size to disguise the limitation. |
| [Cherokee #8, 9 photos](contact-1106-cherokee-rd-unit-8.jpg) | Consistent unit interior/kitchen/bath/access photos. Main image is portrait and soft at large width. All nine have width ≤640px. | Wide homepage crop trims ceiling/floor context. Review an approved focal crop or obtain a genuine landscape lead for this exact unit. No substitute chosen here. |
| [Madison, 15 photos](contact-1824-w-madison.jpg) | Higher resolution throughout, exterior plus rooms/bath/basement. Mixed exposure, vertical perspective and legacy filenames remain visible. | Current lead preserves the facade; mobile crop trims more lateral context. Confirm final crop with the owner. |

**43 of 60 originals are only 480–640px wide.** A requested `1000w` rendition does not create additional source detail. Large card dimensions remain 44vw desktop, 70vw tablet and viewport minus 44px on narrow phones.

Card images use centered `object-fit: cover` at the existing 1.5 desktop / 1.3 mobile ratio. At those ratios, the portrait Cherokee lead retains approximately 50% / 58% of its original vertical extent. Colonial/Smallboat have modest vertical trimming; Madison loses approximately 19% / 29% of its horizontal extent. These are geometry estimates from original dimensions, not assertions about scene content. [Actual card measurements](capture-report.json) and screenshots show the result.

Every selected detail image uses `object-fit: contain`, preserving its full aspect ratio without distortion. Loaded-photo desktop/mobile captures show the real differences in sharpness and exposure. None of the new captures uses an unavailable-photo fallback. Historical Phase 2A fallback images remain explicitly labelled and are not the current photographic evidence.

## Reproduction

From the repository, with normal trusted browser HTTPS access:

```sh
node tests/verify-collection-photos.cjs
python3 scripts/verify-source-photo-mapping.py
python3 scripts/contact-sheet-collection.py
```

`OAKTOWN_BASE_URL` defaults to the hosted review URL. `OAKTOWN_ORIGINAL_DIR` defaults to `/tmp/phase2b-originals`. The verification script asserts deployed hashes, exact mappings and all 60 detail selections. The source script performs read-only TLS-verified requests and compares HTML/percent-decoded URLs without interpreting `+` as a space. No server or inventory writes occur.
