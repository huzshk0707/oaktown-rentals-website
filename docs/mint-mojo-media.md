# Mint Mojo page and media

The new `/mint-mojo/` page keeps the vacation-home experience on the Oaktown website. Homepage, desktop/mobile navigation and footer links now lead here. The existing rental application remains for Louisville homes; Mint Mojo uses a separate date inquiry by email or text.

## Sources

Property facts were checked against the existing Oaktown Squarespace page, `/contact-five`: three bedrooms, two full bathrooms, pool, tiki hut, double fenced lot, screened porch, 150-foot dock and the listed equipment/amenities. The boat lift and fuel tank are excluded from guest use. No price, guest capacity, minimum stay or live availability is invented.

Media comes from the user's **CUD JOE KEY → CUDJOE ORDR** Drive folder, supplied for this website. The 20 selected JPEGs are byte-for-byte copies with descriptive filenames, about 1.2 MB combined. Nineteen belong to the property gallery; the snorkeling photo appears only in the separate island-activities section. The folder's spreadsheet was not opened or imported.

| Drive filename | Website asset in `assets/mint-mojo/` |
| --- | --- |
| 1.jpeg | aerial.jpg |
| 2.jpeg | house-pool.jpg |
| 3.jpeg | pool.jpg |
| 5.jpeg | pool-chairs.jpg |
| 6.jpeg | garden-house.jpg |
| 7.jpeg | canal-dock.jpg |
| 8.jpeg | covered-patio.jpg |
| 9.jpeg | porch-lounge.jpg |
| 13.jpeg | kitchen.jpg |
| 14.jpeg | dining.jpg |
| 16.jpeg | living-room.jpg |
| 18.jpeg | blue-bedroom.jpg |
| 21.jpeg | bathroom.jpg |
| 22.jpeg | primary-bedroom.jpg |
| 24.jpeg | guest-bedroom.jpg |
| 27.jpeg | screened-porch.jpg |
| 28.jpeg | porch-view.jpg |
| 29.jpeg | tiki-hut.jpg |
| 31.jpeg | snorkeling.jpg |
| 34.jpeg | pool-at-night.jpg |

## Motion and video

The current opening uses a real property photo with a gentle 16-second pan/zoom, optional manual house/pool/waterfront photo selection, the shared motion preference and reduced-motion support. It is not an edited video. No autoplaying scene carousel, soundtrack or external embed is used.

`IMG_7113.MOV` is visible in the parent Drive folder (91,469,813 bytes), but exceeds this session's 32 MiB download limit and has not been watched or incorporated. Its duration and content have not been verified. Additional diving/boat-trip clips were not visible in this folder listing. Once accessible, footage can be curated into a short, muted film with a poster, explicit pause control, and a photo fallback. Diving footage belongs in the activities section unless it also establishes the actual house. Outings and dive services must not be implied to be included with the rental.

## Inquiry behavior

Arrival and departure dates are checked in the visitor's local calendar. Departure must follow arrival; past arrivals are invalid. Preparing an inquiry exposes email and SMS links with the selected dates. The visitor sends through their own app. This does not submit to a server, reserve dates or take payment. Phone/email/text contact alternatives remain available. Date values stay on the page and are preserved when switching language.

## Admin integration

This standalone page does not yet have a Mint Mojo content editor. The separate property-admin PR handles Louisville rental listings. When combining the two PRs, keep `mint-mojo/` and `mint-mojo/**` in the CMS branch's static-asset allowlist. Confirm all three page files and the JPEG assets are served by the deployed Worker; preserve private backend/config exclusions.

## Validation

`OAKTOWN_BASE_URL=http://localhost:8787 node tests/mint-mojo.cjs` exercises real local JPEG loading, gallery wrapping/keyboard/focus return, date validation, generated contact links, EN/ES persistence, phone navigation, reduced motion and six widths from 320 to 1920 pixels. The existing `tests/browser.cjs` suite checks the Louisville site. External email/SMS apps cannot be exercised in the managed browser. Live deployment and actual device acceptance are separate from local checks.
