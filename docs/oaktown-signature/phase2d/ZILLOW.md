# Four-property showing-destination audit

Public Zillow search was inspected in an authorized browser without signing in or submitting inquiries. Its rental search did not resolve the four entered Louisville addresses: the page remained at `/homes/for_rent/` with an unrelated default-location result. This does **not** establish that those rentals are absent from Zillow. Search-engine results did not identify trustworthy exact matches. No private Rental Manager or guessed listing/contact URL is used.

The owner replied that they will share public links later. The approved existing property-specific SMS showing action is therefore retained for all four cards, with **Request a Tour / Solicitar una visita** labels. Browser assertions verify all four targets and Cherokee's exact unit; actual SMS sending was not tested.

| Catalogue property | Public Zillow rental / supported tour endpoint | Current destination |
| --- | --- | --- |
| 115 Colonial Drive | Unverified, owner link pending | SMS showing request naming 115 Colonial Drive |
| 4005 Smallboat Ct | Unverified, owner link pending | SMS showing request naming 4005 Smallboat Ct |
| 1106 Cherokee Rd · #8 | Unverified, owner link pending; building-level match would be insufficient | SMS showing request explicitly naming #8 |
| 1824 W Madison | Unverified, owner link pending | SMS showing request naming 1824 W Madison |

[Rendered audit](research/zillow-audit.json) and adjacent per-property screenshots preserve the actual unresolved search states. [Capture report](capture-report.json) records EN/ES Cherokee destination strings. Catalogue rents, deposits, facts and availability were not changed. Zillow discrepancies cannot yet be assessed because no valid exact listing was established.

When supplied, open each public link, confirm exact address/unit and active rental status, inspect its supported tour/contact action and flag any fact mismatch. Use a verified supported inquiry endpoint, otherwise the public listing with an honest Zillow label. Keep SMS for unverified cases. Do not send an inquiry or assume a link for another unit applies.
