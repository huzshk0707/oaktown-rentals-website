# Editing Oaktown listings from your phone or computer

The admin works in a browser. There is no app to install and you will not need GitHub for normal listing edits. These steps apply after the one-time Cloudflare database, storage and sign-in setup is complete.

## Open and sign in

1. Open `https://oaktown-rentals-website.huzaifashaikhhp.workers.dev/admin/` in Safari or Chrome.
2. Sign in with one of the three approved email accounts. If email-code sign-in is configured, enter the code Cloudflare sends to that email address.
3. You will see your property collection. Bookmark this page. On iPhone, Safari's Share menu offers **Add to Home Screen**. On Android, Chrome's menu offers **Add to Home screen** or a shortcut option, depending on the version.

## Update a home

1. Find the address and tap **Edit listing**.
2. Change the rent, deposit, bedrooms, bathrooms, availability or wording as needed.
3. Tap **Save draft** to save without changing the live website.
4. Tap **Preview listing** to review the current form.
5. Tap **Publish listing** to update the website. Open the public website to check it.

The English content is the default. The **Spanish version** section lets you add Spanish wording; fields left empty use the English wording.

## Add photos

Save a new property's address and basics first. Tap **Add JPG, PNG or WebP photos**, then choose photos from your phone or computer. You can use up to **20 photos per property**, at most **8 MB each**. Add a short description such as “Kitchen facing the dining room.” Use **Earlier** and **Later** to change the order. The first photo is the main listing image.

Uploads stay private until the listing is published. Save your draft after adding or reordering photos, then preview and publish when ready. If your phone provides an unsupported file type, export or save the photo as a JPG first.

## Add or remove a property

- Tap **Add property**, enter the basics and save a draft. Then add descriptions, lease terms and photos, preview, and publish.
- The **web address** is created from the title when you add a home. Check it before the first save; it stays permanent afterward so public links keep working.
- Tap **Archive** to remove a listing from the public website while keeping it saved in the admin. Find it using **Show → Archived**, edit it and publish to bring it back.
- Tap **Unpublish** to keep a listing as a private draft.

If another editor changes the same property, the admin will ask you to reload instead of overwriting their work. Copy any unsaved text you want to keep before reloading. Sign out when you finish, especially on a shared device.

## What a “request” means

A request is a browser asking the website for something: a page, stylesheet, API response or photo. Visitors create requests too; the free Worker allowance is not just for admin edits. Browser caching can reduce repeat requests. This site's Worker checks routing before serving assets, so those Worker invocations count toward its daily allowance.

For seven homes with 20 photos each, 2 MB per photo would be about **280 MB** of photos. Even at the per-photo 8 MB limit, the active 140 photos would be about **1.12 GB**. Actual usage can also include replaced/private uploads retained in storage. This is comfortably below 10 GB for the expected active collection, but traffic and retained files should still be monitored. Free allowances are not an unlimited-usage promise.

[Cloudflare setup and current cost details](admin-setup.md)
