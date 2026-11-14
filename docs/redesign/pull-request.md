## Public rental catalogue redesign

The former dark, scroll-pinned introduction delayed browsing and competed with listing information. This change introduces a shorter photo-led catalogue in Oaktown green and warm ivory, clearer property cards, readable rental details, and manually selected hero photos. It preserves the existing routes, application/showing links, bilingual property content, galleries, filters and CMS integration.

The public stylesheet is scoped so Mint Mojo retains its existing design. No admin implementation, property records, API/authentication, migrations, original media or deployment configuration changed. Leslie's admin proposal is documentation only.

### Review material

- [Audit, direction and before/after screenshots](docs/redesign/README.md)
- [Nine-resource evaluation and tooling review](docs/redesign/research.md)
- [Leslie’s admin proposal](docs/redesign/admin-proposal.md)
- [Validation and limitations](docs/redesign/validation.md)

### Validation

44 public browser checks, 35 supplemental design checks, 3 CMS/security tests, admin browser workflow, Mint Mojo suite, syntax checks and Wrangler dry-run passed locally. Rendered axe scans found no confirmed WCAG A/AA violations across four desktop/mobile home/detail cases; two gallery contrast checks per detail scan remain incomplete. Independent review fixes cover mobile control clearance, lightbox focus contrast and accurate hero image sizing.

### Draft status

Do not merge or deploy without owner approval. External property photography and production preview are blocked by this environment's proxy. Screenshots clearly show reproducible failed-image states; real-photo crop/quality acceptance and CDN performance remain pending. Hallmark and Impeccable are review inputs, not claimed clean certifications; their findings and compatibility limits are documented.
