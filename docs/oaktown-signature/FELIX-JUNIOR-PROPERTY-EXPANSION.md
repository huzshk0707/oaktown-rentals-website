# FELIX JUNIOR — Sloemer and Troutwood property expansion

Owner authorized a separate draft PR. Based on PR #26 checkpoint dd40325f9f2c8248efac6be32a87050587920543; original hero and four existing property records/images preserved. No production deployment, CMS database write, change to PR #25/26/27, or merge.

## Source and publication gates
- [Owner's existing listing reference](https://docs.google.com/document/d/1vRuJlc1eZd5QmhqLnTXm2Tp1vHQ7zqdMwfdlylDJjIE/edit)
- Sloemer: owner-supplied remodeled 3-bedroom/2-bath, approximately 1,400 sq ft, LVP, plumbing/electrical, kitchen/bathrooms, unfinished basement, detached one-car garage. [Trulia](https://www.trulia.com/es/home/208-sloemer-ave-new-albany-in-47150-99120033) advertises $1,850 rent/deposit; confirm with owner before adoption. File draft leaves both null, current availability unconfirmed. Eight genuine [Drive originals](https://drive.google.com/drive/folders/1JCxQPAmmVr4V1cfdpH5ZBd3n4y8LR4gK) await transfer to local assets. Do not make Drive photos publicly shared or substitute stock imagery.
- Troutwood: [Zillow historical profile](https://www.zillow.com/homedetails/8008-Troutwood-Ct-Louisville-KY-40291/73650528_zpid/) is off market. January 2027 is inferred from November source instructions. Do not publish estimated rent or historical bedroom/bath counts as remodeled facts. Contact for updates rather than apply or request an immediate tour. Authentic owner-approved exterior still required.
- Both new cards intentionally have no property image until the approved files are transferred. Empty image arrays, noninteractive detail photo placeholder, hidden empty galleries. Exact property-specific SMS; historical Troutwood source labeled accordingly.
- File-mode catalogue only. If preview uses database mode, the CMS adapter replaces file data, so the two records will not appear there until a separate staging-safe import is authorized.

## Verification
- JavaScript syntax parsed for data.js, property-cards.js and app.js.
- Evaluated actual catalogue and card/detail templates with EN/ES fixtures. Six unique records, original four records and original image arrays unchanged, unknown prices hidden or inquiry text, upcoming status, no empty gallery controls and no Troutwood apply actions passed.
- Added tests/property-expansion.test.mjs for repeatable Node regression. Full browser and hosted preview tests pending; network checkout unavailable here. Existing suites that assert four records need an intentional six-listing review, not blind replacement. Run new test with node --test tests/property-expansion.test.mjs; then complete all applicable suites after media import.
- Original approved hero imagery and hero markup are not altered. No live inventory, payment, auth or production configuration change.

## Next
1. Import eight genuine Sloemer images from Drive, review order and rights.
2. Obtain approved Troutwood exterior and confirm January timeline; confirm Sloemer rental terms.
3. Verify six cards, filters, detail routes, keyboard/history, EN/ES and mobile with actual preview. Review all existing test assumptions and run the full regression suite. Keep draft until owner approval.
