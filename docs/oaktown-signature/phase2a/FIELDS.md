# Property field availability — Phase 2A

Audit of the working **file catalogue**, not a query or freshness certification of production D1. Source: `data.js`, retained from `262f153`; exact source hash, every photograph and destination are in [catalogue-audit.json](catalogue-audit.json). Reproduce with `node scripts/audit-property-catalogue.mjs`. All four catalogue entries are displayed; Afterglow is brand photography, not a rental record.

| Address (exact unit identity) | Neighborhood | Monthly rent / deposit (USD) | Beds / baths | Availability in file | Main / gallery |
| --- | --- | --- | --- | --- | --- |
| 115 Colonial Drive | St. Matthews | 1,699 / 1,699 | 3 / 1 | Unknown (absent) | First `colonial` image / 19 total |
| 4005 Smallboat Ct | Okolona | 1,525 / 1,525 | 3 / 1 | Unknown (absent) | First `smallboat` image / 17 total |
| 1106 Cherokee Rd · #8 | Cherokee Triangle | 950 / 950 | 1 / 1 | Unknown (absent) | First `cherokee8` image / 9 total |
| 1824 W Madison | Russell | 1,100 / 1,100 | 3 / 1 | `coming_soon` | First `madison` image / 15 total |

These are existing catalogue values, not newly verified current offers. No record says Ready Now. Madison's Coming soon badge is retained; the schema has no verification timestamp. Smallboat's historical showing date must not be interpreted as current availability. Cherokee **#8** must never be conflated with the removed #6. Madison remains in the collection.

| Property | Square footage | Parking evidence in existing copy | Pet policy evidence in existing copy |
| --- | --- | --- | --- |
| Colonial | Not provided | “Two-car garage” feature | “Pet terms and screening requirements: confirm before applying” — no approval claim |
| Smallboat | Not provided; 0.25-acre **lot** is not interior area | “Off-street parking” feature | Not provided |
| Cherokee #8 | Not provided | Not provided | “Pet terms: confirm before applying” |
| Madison | Not provided | Not provided | Existing terms: approved pets require photo, $25 monthly per pet and $150 nonrefundable deposit per pet; do not generalize as pets allowed |

Parking and pets above are **prose**, not structured fields suitable for filtering or automatic amenity icons. No new fields, inferred policies, geocodes or square footage were added.

## Shared destinations and rendering contracts

- Detail routes: `#home/115-colonial-drive`, `#home/4005-smallboat-ct`, `#home/1106-cherokee-rd-unit-8`, `#home/1824-w-madison`.
- Showing: per-address bilingual SMS to **+1 502 500 1070**. Availability inquiry uses the same number with a different message. Preserve the unit marker in both.
- Apply: existing `https://oaktownrentalsapplication.fillout.com/95`, opened with `noopener noreferrer`. No Resident Portal exists.
- EN/ES summaries, descriptions, features and terms exist for all four properties; names/neighborhoods are shared proper nouns. Spanish fallback remains English when an optional translated array/string is empty.
- Filters use structured neighborhood, numeric minimum bedrooms and bathrooms. No property type filter. No eligibility inference from description text.

## CMS compatibility and gaps

`cms/model.mjs` validates name/slug/city/neighborhood, numeric rent/deposit/bedrooms/bathrooms, bilingual text arrays, availability enum and photo URL/alt objects. It has no separate street-address object, square footage, parking, pet-policy field, photo dimensions or verification timestamp. Publishing requires valid positive rent and at least one allowed photo with alt text; draft numeric adapters retain their existing normalization behavior.

`cms-client.js` maps public CMS photos to `cms-{slug}` galleries and escapes all strings. `admin/preview.js` maps private media to protected admin URLs and escapes text. Card rendering accepts this existing escaped boundary **once**, with no double-escaping. File data is trusted repository editorial content. CMS outage/empty-state logic is unchanged. `cms/worker.mjs` returns file mode when configured for it; no schema, database, publication, Access or storage changes are needed for this phase.

A later separately approved CMS migration must reconcile these four exact unit identities and prices with owner-verified current records, select the publication source, rehearse against disposable data, back up and approve the content diff. This audit does not authorize migration or publication.
