# Rendered reference research and separate proposals

## Bethune Lofts, observed in Chromium

Inspected https://bethuneloftsdetroit.com/ at 1440×1000. [Recorded DOM/geometry/destinations](research/bethune-interactions.json), [initial panels](research/bethune-options-initial.png), [hover](research/bethune-options-hover.png), [location section](research/bethune-location-full.png).

The three Explore Your Options panels initially measure about 429px wide ×600px high. Hover smoothly enlarges the active panel to about 644–647px while siblings contract to about 320–322px. Inactive titles disappear while VIEW remains. Leaving restores equal widths. Keyboard focus in this captured version did not produce that expansion. The Oaktown proposal adds explicit keyboard/click selection and removes inactive card actions from the tab order.

Actual links: Amenities → `/about`; Available Units → `https://designbuilddetroit.managebuilding.com/Resident/rental-application/new` (an application destination); Schedule A Tour → `/contact`. The contact route was opened, with no form submission. We reuse interaction principles, not their content, assets or inquiry destinations.

The location section is approximately a desktop viewport (1440×1000), with a roughly 490px left copy column and a full-background Google Maps iframe for 1800 W Bethune St, Detroit, zoom18. Copy transitions into a soft white map gradient. The captured map is only partially rendered/washed out: a small street segment appears while much of the frame remains flat. Its configured embed is verified; this environment does not establish the complete intended map appearance. Screenshots preserve that limitation.

## Expanding real-home cards

The isolated prototype clones the existing genuine cards and uses a 2.4:1 active/sibling flex ratio with a restrained 550ms transition. The normal Gallery/Grid section is untouched. Pointer hover, click, Tab focus and arrow/Home/End keys activate a panel; inactive card contents are inert. Mobile uses a vertical accordion with a 270px image, preserving usable card text instead of squeezing four columns. Reduced motion and the site's motion-off preference remove transitions. Native photo/detail/tour delegates continue to work; detail navigation exits the prototype.

## Rooted in Louisville

A full-viewport desktop split pairs authentic local photography and established company copy with an interactive neighborhood map. Mobile stacks naturally. A forest-green divider followed by the existing Lobster Nirvana feature establishes the transition; the vacation section's content and booking destinations are unchanged.

The existing unmodified `assets/louisville/louisville-ohio-river.jpg` is **Louisville from Ohio River September 2026 002**, King of Hearts, **CC BY-SA 4.0**. [Full source/provenance](../../../assets/louisville/README.md). CSS cropping/gradient is declared. Author, source and license remain in accessible Photography & map credits, including the retained photo license. No generated skyline or replacement source. The production section's existing credit overlay is unchanged until proposal approval.

Markers are neighborhood reference points, **not home pins or tenant locations**. Exact public area coordinates and sources are retained in [neighborhoods.json](research/neighborhoods.json):

| Area | Latitude, longitude | Source |
| --- | --- | --- |
| St. Matthews | 38.24988, -85.6357424 | OpenStreetMap relation 130683, Nominatim city result |
| Okolona | 38.1411796, -85.6877379 | OpenStreetMap node 153578210 |
| Cherokee Triangle | 38.23526857, -85.71244061 | Public Wikipedia Cherokee Triangle, Louisville geographic coordinates; Nominatim query did not resolve |
| Russell | 38.2535489, -85.7863582 | OpenStreetMap way 1070814306 |

List and marker selection share the same active neighborhood. Browse homes applies the actual existing neighborhood filter; all four source neighborhoods match catalogue values. Counts describe homes in the collection, not verified immediate availability. The list works without loading the map, with live status and pressed states; marker keyboard activation is provided by Leaflet.

### Map implementation considerations

- Prototype: **Leaflet 1.9.4 (BSD-2-Clause)** loaded from unpkg, **OpenStreetMap standard tiles** at `tile.openstreetmap.org`, OSM/ODbL attribution visible on the map and in credits. Version is pinned; no API key, account, paid subscription or credentials created.
- Privacy: no map requests until Explore the map is selected. Activation sends normal request metadata/IP to unpkg and OSM; no browser geolocation or property/tenant data. Accessible neighborhood selection/filtering works without those requests. Provider privacy language and production asset hosting should be reviewed if adopted.
- Performance: the authentic skyline is already local; Leaflet/CSS/tiles load only on demand. No tile prefetch, bulk download or service-worker caching; scroll-wheel zoom disabled to preserve page scrolling. Provider failure leaves the list usable.
- Cost: this small prototype has no direct API charge. Public OSM tile service has usage rules, no SLA and no guaranteed production capacity. Before production adoption, select self-hosted Leaflet assets and a tile provider appropriate to expected traffic, caching rules, commercial terms and budget. Do not assume unlimited free hosting. This proposal does not create a paid service or authorize production map rollout.

Prototype code stays under `docs/oaktown-signature/phase2d/prototypes/`, excluded by `.assetsignore`. Delete/switch away from the review iframe to restore the approved page; no runtime/data migration. Creative approval is required before moving any proposal into the public homepage.
