# Phase 4A property presentation

## Baseline audit

Chromium at shared commit bc163b2. Homepage on the left, Colonial Drive on the right. [Desktop](before-desktop.jpg) · [Mobile](before-mobile.jpg).

| Element | Findings before implementation |
| --- | --- |
| Logo and navigation | Both routes already use the same green transparent logo, positioned identically at 158px wide on desktop and 110px on mobile. Menu order, spacing, underlines, sequential dropdown entries, language and motion controls come from the same header. |
| Header surface and scroll | The homepage starts over a photograph. Colonial opens with text beside an inset photo, so ivory is appropriate. The homepage hides its header during downward desktop travel after the hero. Detail routes keep it fixed because scroll detection only recognizes the cinematic hero. |
| Typography and color | Home uses Georgia editorial headings. Colonial uses Manrope for the address and section headings, and a different ivory (#faf7ef). |
| Actions | The homepage has 12px sage buttons. Colonial uses a dark pill (999px radius), an understated inline tour inquiry and a separate text-style application link. |
| Motion, navigation and footer | Both routes share native scrolling, the reveal observer, view-transition and history logic, motion preferences and the forest-green footer. Detail routes also have a sticky listing summary that must follow the header. |
| Responsive layout | Home and detail share the mobile menu and logo. Colonial stacks its current text and photograph. Preserve that composition and keep the mobile header available. |
