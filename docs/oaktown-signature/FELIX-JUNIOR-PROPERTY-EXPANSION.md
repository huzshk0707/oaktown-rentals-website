# FELIX JUNIOR — Sloemer and Troutwood property expansion

Owner authorized a separate draft PR. Based on PR #26 checkpoint dd40325f9f2c8248efac6be32a87050587920543; original hero and four existing property records/images preserved. No production deployment, CMS database write, change to PR #25/26/27, or merge.

## Source and publication gates
- [Owner's existing listing reference](https://docs.google.com/document/d/1vRuJlc1eZd5QmhqLnTXm2Tp1vHQ7zqdMwfdlylDJjIE/edit)
- Sloemer: owner-supplied remodeled 3-bedroom/2-bath, approximately 1,400 sq ft, LVP, plumbing/electrical, kitchen/bathrooms, unfinished basement, detached one-car garage. [Trulia](https://www.trulia.com/es/home/208-sloemer-ave-new-albany-in-47150-99120033) advertises $1,850 rent/deposit; confirm with owner before adoption. File draft leaves both null, current availability unconfirmed. Eight genuine [Drive originals](https://drive.google.com/drive/folders/1JCxQPAmmVr4V1cfdpH5ZBd3n4y8LR4gK) are imported as local assets (see media checkpoint below). Do not make Drive photos publicly shared or substitute stock imagery.
- Troutwood: [Zillow historical profile](https://www.zillow.com/homedetails/8008-Troutwood-Ct-Louisville-KY-40291/73650528_zpid/) is off market. January 2027 is inferred from November source instructions. Do not publish estimated rent or historical bedroom/bath counts as remodeled facts. Contact for updates rather than apply or request an immediate tour. Authentic owner-approved exterior still required.
- Troutwood intentionally has no property image until the approved exterior is transferred. Empty image arrays, noninteractive detail photo placeholder, hidden empty galleries. Exact property-specific SMS; historical Troutwood source labeled accordingly.
- File-mode catalogue only. If preview uses database mode, the CMS adapter replaces file data, so the two records will not appear there until a separate staging-safe import is authorized.

## Verification
- JavaScript syntax parsed for data.js, property-cards.js and app.js.
- Evaluated actual catalogue and card/detail templates with EN/ES fixtures. Six unique records, original four records and original image arrays unchanged, unknown prices hidden or inquiry text, upcoming status, no empty gallery controls and no Troutwood apply actions passed.
- Added tests/property-expansion.test.mjs for repeatable Node regression. Full browser and hosted preview tests pending; network checkout unavailable here. Existing suites that assert four records need an intentional six-listing review, not blind replacement. Run new test with node --test tests/property-expansion.test.mjs; then complete all applicable suites after media import.
- Original approved hero imagery and hero markup are not altered. No live inventory, payment, auth or production configuration change.

## Next
1. Sloemer eight-photo import completed; verify in hosted preview and confirm publication rights.
2. Obtain approved Troutwood exterior and confirm January timeline; confirm Sloemer rental terms.
3. Verify six cards, filters, detail routes, keyboard/history, EN/ES and mobile with actual preview. Review all existing test assumptions and run the full regression suite. Keep draft until owner approval.

## Sloemer media checkpoint

- Commit `1e7b070353594033679cfe6fa3c6aa3777c175ff` imports all eight original JPEGs from the Drive Originals folder under `assets/properties/208-sloemer-ave/01.jpeg` through `08.jpeg` and wires them into `DATA.images.sloemer` in source order. Front exterior is lead; seven interior photos are orientation-6 EXIF portrait files (raw 640x480, displayed 480x640). Exterior is 1320x896. No enhancement, re-encoding, substitution or Drive sharing change.
- Verified all eight JPEG decodes and Git blob hashes locally against the actual remote file metadata; each source byte length and asset path matches. PR head readback confirmed the commit. Full browser/hosted testing is still pending.
- Troutwood Zillow historical profile is off market; no approved current exterior was available. Leave that placeholder until the authentic photo is supplied.

| Asset | Original SHA-256 |
|---|---|
| 01.jpeg | `f321f2eee58ab524ad9fe52866d1527ab35f2d5017305f52aab499a7334a1826` |
| 02.jpeg | `cc1d762af9446dd4aaf3aa13d7b3937e744088e81b946db1e570beae75aa729d` |
| 03.jpeg | `9cf51bcdd38979e6fb34455fd7b04fb385ebf629a9490c7649516b961bc8c56f` |
| 04.jpeg | `41bbc5566c69ad1c4d59629f6cecbda7ba809414684721d2e9d5a5f5776a232a` |
| 05.jpeg | `b70a7894924dffc51c656de2f669787a69cf9f9fc98320f682b83d274691fc41` |
| 06.jpeg | `625a0e7af1fd33b93f1ea5c758f847557c48655e1afc72505e968a8da9d77de1` |
| 07.jpeg | `e1bc52fae1cdf866bf376ac30d089a0fb03ce3acdef3f06a130b5d35f48bfc31` |
| 08.jpeg | `789ffe06056b1e4bc4e66b64fc822803a6298167668a0c64c75ad73e66825131` |

## Colonial Drive approved photography checkpoint

- Owner approved the 19 numbered images in [Drive](https://drive.google.com/drive/folders/1gw823lsLxikaPsLcs6VwRYvhclW1LXSI). Imported the approved JPEG bytes unmodified in commit `404a433ec02e05d73c8a3068ce48fbf6ff0bbe66` to `assets/properties/115-colonial-drive/01.jpg` through `19.jpg` (3,351,928 bytes total).
- Updated only the Colonial image array in `data.js`, using the approved numbered sequence with the front exterior first. All six property records, other galleries, hero code, hero assets and original Signature assets remain unchanged. Prior URLs are preserved in Git history.
- Verification: all 19 JPEGs decoded locally and Git blob hashes matched the original Drive bytes and remote asset metadata; all 19 paths resolve to committed files. EN/ES card and detail template checks passed (19 photos and 19 thumbnails); syntax passed; `/assets/**` is already included by deployment allowlist. Full browser/hosted preview testing is still pending; no CMS or production changes. Original source resolution preserved, including 480x640 portrait interiors.

## Smallboat Court photography — identity audit and partial integration

All 17 owner-approved edits are retained in the [Drive collection](https://drive.google.com/drive/folders/1y8ir-fCCRPiGg8waGgd7_kyfUP4vzJRj). Compared each against its original (13 November 16 email attachments and four user-supplied legacy listing images). Eleven edits passed visual identity review: 01, 02, 04–11, 13. Their exact JPEG bytes were imported in commit `2f50041421a031c90df9cff85973a4098f11eb8a` under `assets/properties/4005-smallboat-ct/` (1,276,436 bytes). Local decode and Git hashes matched Drive transfer and remote metadata. Existing 17-slot catalogue order, original lead exterior, other property records/images, and homepage hero remain unchanged. English/Spanish card and detail template rendering passed, including 17 thumbnail references. Full browser and hosted verification pending; no live CMS or production changes.

Publication hold on remaining enhanced photos (original existing URLs retained, no generated replacements committed):
- 03 (IMG_4329.jpeg): generated cleanup reconstructed tile/grout and other surface details; use original-based localized removal of loose litter only.
- 12 (IMG_4330.jpeg): generated cleanup reconstructed flooring and equipment details; use conservative localized removal of superficial dirt only, preserve actual fixtures and material condition.
- 14 (1.webp): generated exterior changed architectural/landscape detail; original has a 2015 listing broker notice. Current condition and rights to reuse without attribution not established.
- 15 (2.webp): generated kitchen changed cabinetry/fixtures and removed the broker notice. Preserve attribution unless permission established; verify current condition.
- 16 (4.webp): generated cabinet wall changed proportions/framing and floor texture; use original-based tonal adjustment only if current condition confirmed.
- 17 (7.webp): generated carpeted room altered texture and proportions; current carpet versus newer flooring needs confirmation. Use original-based grade if current condition confirmed.

Owner approval of the visual edits is recorded but does not establish factual accuracy or third-party reuse permission. Keep draft. Preserve the existing source URLs pending faithful corrections, rights/current-condition review, and owner approval of corrected variants.
