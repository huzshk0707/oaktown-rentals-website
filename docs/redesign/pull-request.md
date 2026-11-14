## Public rental catalogue redesign

The dark, scroll-pinned introduction delayed browsing and competed with listing information. This change introduces a shorter photo-led catalogue in Oaktown green and warm ivory, clearer property cards, readable rental details, and manually selected hero photos. It preserves existing routes, application/showing links, bilingual property content, full galleries, filters and CMS integration.

Public styles are scoped so Mint Mojo retains its existing design. No admin implementation, property records, API/authentication, migrations, original media or deployment configuration changed. Leslie's simplified admin proposal is documentation only. The latest footer-wordmark removal from `main` is included.

### Review material

- [Audit, visual direction and before/after screenshots](docs/redesign/README.md)
- [Nine-resource evaluation and tooling review](docs/redesign/research.md)
- [Leslie’s admin proposal](docs/redesign/admin-proposal.md)
- [Validation and remaining release checks](docs/redesign/validation.md)

### Validation

44 public browser checks, 35 supplemental design checks, 3 CMS/security tests, admin browser workflow, Mint Mojo suite, syntax checks and Wrangler dry-run passed locally. Refreshed desktop/mobile captures use the current published records and original photography. All 39 gallery photos decoded, and their property ownership and order match the public records.

Real-photo axe scans found zero confirmed WCAG A/AA violations in six desktop/tablet/mobile cases, including Spanish at 320px. Two gallery contrast checks per detail scan remain incomplete; their solid labels were also reviewed visually. Independent review fixes cover mobile control clearance, lightbox focus contrast and hero image sizing.

### Release boundary

Owner review is pending. Do not merge or deploy without approval. Native Safari/Firefox testing and uncached network performance measurement remain release checks. Source photos were downloaded through a TLS-verified client and supplied to the local browser because its proxy CA is not trusted; screenshot results are not live CDN performance measurements. Hallmark/Impeccable findings and compatibility limits are documented without claiming a clean certification.
