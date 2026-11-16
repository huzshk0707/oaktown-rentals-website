# Editing Oaktown listings from your phone or computer

The admin works in a browser. There is no app to install and you will not need GitHub for normal listing edits. These steps apply after the one-time Cloudflare database, storage and sign-in setup is complete.

## Open and sign in

1. Open `https://oaktown.rentals10.workers.dev/admin/` in Safari or Chrome.
2. Sign in with one of the three approved email accounts. If email-code sign-in is configured, enter the code Cloudflare sends to that email address.
3. You will see your property collection. Bookmark this page. On iPhone, Safari's Share menu offers **Add to Home Screen**. On Android, Chrome's menu offers **Add to Home screen** or a shortcut option, depending on the version.

## Update a home

The property collection shows the version visitors see when a home is **On website**. Rental availability is a separate label. A saved private change appears beneath the live details; **Show → Needs publishing** finds drafts and saved changes that are not live yet. **Quick edit**, **Photos** and **Preview draft** provide shortcuts into that property's draft.

1. Find the address and tap **Edit listing**.
2. Choose **Details**, **Photos**, **Description**, **Rental terms** or **Review & publish**. Change only the information you need to update.
3. Tap **Save draft** to save without changing the live website.
4. Tap **Preview listing** to check the current form in the actual website layout. Choose **Desktop** or **Mobile** and **English** or **Español**. This preview includes unsaved edits and does not save or publish them. Showing, application and navigation links are inactive inside the preview.
5. Open **Review & publish** to check missing information and see what will change. Tap a missing item to go to its section. **Contact for availability** can remain selected when dates are unconfirmed; publishing does not turn it into an available-now claim.
6. Tap **Publish listing**, review the confirmation, then tap **Publish changes** to update the website. **Keep editing** cancels without saving or publishing. After publication, **View live listing** opens the public result.

The save, preview and publish controls stay available as you scroll through the editor, including on a phone. Their status distinguishes unsaved work, a saved private draft and the version on the website.

English content is the default. Expand **Spanish description** or **Spanish rental terms** to add Spanish wording; fields left empty use the English wording. **Advanced settings**, under Details, keeps the web address and original listing link out of everyday editing.

## Add photos

Enter a new property's address and basics first. In **Photos**, tap **Add photos**, then choose photos from your phone or computer. Uploading saves the current property details as a private draft first. You can use up to **20 photos per property**, at most **8 MB each**, in JPG, PNG or WebP format.

Each selected file has its own upload status. If a file fails, successful uploads stay in place. Tap **Retry** beside the failed file to send only that file again, or **Dismiss** to remove it from the queue. Retry or dismiss unfinished files before publishing. If your phone provides HEIC or another unsupported file type, export or save the photo as a JPG first.

Add a short description to every photo, such as “Kitchen facing the dining room.” Tap **Set as main photo** on any later photo to move it to the first position. Hold a photo's **Drag** handle and move it to a new position, including across rows. On a phone, hold the handle briefly before dragging; hold near the top or bottom of the screen to scroll through a long gallery. You can also use **Earlier** and **Later**, or focus a handle and use the arrow keys, **Home** or **End**. The first photo is the main listing image.

New uploads stay private until the listing is published. Save your draft after adding photos, changing descriptions or reordering, then preview and publish when ready.

## Add or remove a property

- Tap **Add property**, enter the basics and save a draft. Then add descriptions, lease terms and photos, preview, and publish.
- The **web address**, inside **Details → Advanced settings**, is created from the title when you add a home. Check it before the first save; it stays permanent afterward so public links keep working. It changes the property's link, not the website's domain.
- Expand **Listing actions** and tap **Archive** to remove a listing from the public website while keeping it saved in the admin. Confirm the action. Find it using **Show → Archived**, edit it and publish to bring it back.
- Under **Listing actions**, tap **Unpublish** and confirm to keep a listing as a private draft.

If another editor changes the same property, the admin will ask you to reload instead of overwriting their work. Copy any unsaved text you want to keep before reloading. Sign out when you finish, especially on a shared device.

## What a “request” means

A request is a browser asking the website for something: a page, stylesheet, API response or photo. Visitors create requests too; the free Worker allowance is not just for admin edits. Browser caching can reduce repeat requests. This site's Worker checks routing before serving assets, so those Worker invocations count toward its daily allowance.

For seven homes with 20 photos each, 2 MB per photo would be about **280 MB** of photos. Even at the per-photo 8 MB limit, the active 140 photos would be about **1.12 GB**. Actual usage can also include replaced/private uploads retained in storage. This is comfortably below 10 GB for the expected active collection, but traffic and retained files should still be monitored. Free allowances are not an unlimited-usage promise.

[Cloudflare setup and current cost details](admin-setup.md)
