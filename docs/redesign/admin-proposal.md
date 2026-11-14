# Leslie’s property editor — proposal only

No admin code, API, schema, storage, or authentication changes are included in this phase.

## What already works

`admin/admin.js` already opens to property cards, supports search/state filters, saves drafts separately from published snapshots, publishes/unpublishes/archives, previews a draft, uploads multiple files, labels the first photo as the main image, and reorders via Earlier/Later buttons. Optimistic version checking protects against stale edits. Uploads remain private until their property snapshot is published.

The friction is presentation: a long technical form, URL/source fields competing with rental details, sequential upload messages, and repeated movement clicks for large galleries. A new backend is unnecessary.

## Recommended flow

1. **Your properties.** Show each home's main photo, address, monthly rent, availability and publication state. “Published — changes saved as draft” must be distinct from availability (“Rented”, for example). Put **Add a rental** at the top. Keep search and plain-language filters: All, On website, Drafts, Archived.
2. **Edit a rental.** Address and save state at the top; a compact rail links to Details, Photos, Description, Rental terms and Spanish. Use a single scrolling page rather than forcing Leslie through a wizard on every edit. On phones, use section links above the form.
3. **Details.** Name/address, neighborhood, rent, deposit, bedrooms, bathrooms and availability. Use explicit labels and inline examples; retain entered values after errors. Do not silently fill unknown availability or turn blanks into invented values.
4. **Photos.** A large “Add photos” button and drop zone; immediate thumbnails, individual progress and failures, retry only failed files. Label the cover **Main listing photo**, with a direct **Use as main photo** action. Drag handles reorder the gallery; keep **Move earlier / Move later** for keyboard, touch alternatives and accessibility. Announce “Moved photo 4 to position 2.” Captions remain editable. Removing a photo updates the draft, with Undo before saving.
5. **Description and terms.** Plain paragraphs and an Add feature / Add term control, not raw JSON or developer fields. Separate English and Spanish editing; clearly mark missing Spanish content and explain the existing English fallback. Do not generate translations silently.
6. **Preview and publish.** Persistent **Save draft**, **Preview**, **Publish changes**. Preview clearly says “Only you can see this draft.” Show the property address, photo count and changed fields before publication. On success, show **View on website** with the real property link. Keep a clear unpublished-changes state until publication succeeds.

## Tools worth using

| Resource | Recommendation | Integration boundary |
| --- | --- | --- |
| [Uppy](https://github.com/transloadit/uppy) | Evaluate Core + Dashboard + XHRUpload for a small upload queue with per-file progress and retries. Pin a reviewed release when implementation is approved. | Existing `POST /api/admin/properties/:id/photos` accepts one raw image per request. Configure `formData:false`, `bundle:false`, same-origin authenticated requests, the correct image Content-Type, and normalize its response into the current photo shape. Save a new draft before uploading. Do not install Companion, remote-source plugins, a Tus server or direct public R2 credentials. |
| [SortableJS](https://github.com/SortableJS/Sortable) | Lightweight drag handles, useful alongside the existing buttons. | Persist the ordered `photos` array through the current versioned save endpoint. Disable sorting during save/upload. Keep button focus stable, live announcements and reduced-motion support; drag alone is insufficient. |
| [Vercel guidelines](https://github.com/vercel-labs/web-interface-guidelines) | Keyboard support, ≥44px phone controls, ≥16px phone inputs, explicit save feedback, paste support, focus restoration and protection from accidental loss. | No change to Access authentication or permissions. |

Native multi-file selection already works. Uppy should be adopted only if its progress/retry experience earns the additional admin-only bundle; it is not a requirement for the public website. Current source limits are **20 photos per property** and **8 MB per image**; show those limits before upload and retain server validation. The current API is not resumable; do not label a simple retry as resume.

## Advanced settings

Collapse the permanent web-address slug and original source link under **Advanced**. Generate a readable slug for a new rental, explain permanence before the first save, and preserve the existing read-only behavior afterward. Any future URL rename/redirect feature needs separate approval and backend planning. Never show Access audiences, R2 keys, environment bindings or database identifiers to Leslie.

## States that need explicit design

- Unsaved edits, saved draft, published with pending draft edits, publishing, success and failure.
- Partial photo-upload success: keep completed uploads, retry failures without duplicate entries, and do not publish while uploads are pending.
- Access session expired: retain recoverable local edits while requesting sign-in; never pretend they were saved.
- Version conflict: explain that someone else saved newer changes and offer reload/review instead of overwriting.
- Empty collection with one Add a rental action; useful error message when loading fails.
- Archive/unpublish confirmation names the property and explains its removal from the public website. Archived records remain recoverable.

## Acceptance test with Leslie

Have Leslie add a rental, upload several photos, choose a cover, reorder, edit rent, preview in English and Spanish, save a draft, publish, then unpublish. Verify the public site shows only the published snapshot and that each image remains tied to its original property. Test keyboard-only operation, a narrow phone, interrupted uploads, expired Access, a conflicting save and accidentally navigating away. Usability acceptance belongs to Leslie; this document does not claim those sessions have happened.
