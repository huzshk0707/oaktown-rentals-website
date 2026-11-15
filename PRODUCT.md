# Oaktown Rentals

Facts and constraints confirmed by the redesign brief and existing public repository.

- Public website for prospective tenants seeking rental homes in Louisville, Kentucky and surrounding counties; visitors compare homes, inspect photographs, request showings by text, and follow the existing online application link.
- English and Spanish content, property routes, filters, full galleries and public contact information must remain available.
- Existing Workers, D1, R2 and Cloudflare Access infrastructure; private property administration at `/admin/`. A published property snapshot is authoritative, including an empty collection.
- Display the original supplied Oaktown logo in both the header and footer. Do not replace it with a text wordmark or redraw it without the owner's explicit instruction. Keep the green brand identity, property descriptions and unit-specific photographs. No invented availability, rent, deposits, amenities, testimonials or trust metrics.
- The Rooted in Louisville section uses one authentic Louisville city photograph, with its source/license attribution, rather than a collage of rental-property photographs.
- This phase redesigns public presentation only. Admin work is a proposal. No production data, authentication, secrets, migrations or deployment configuration changes.
- Review on a separate branch and pull request. Production deployment and merging require the owner's approval.
- The existing preview is noindex/nofollow. Launch indexing is a separate decision.
