> Phase 1B adds the owner-supplied AI-assisted enhanced Afterglow for the explicitly approved public review. [Source files, hashes, comparison and approval limits](phase1b/README.md#asset-provenance-and-approval). Original property/photo rights are confirmed. Enhanced architectural accuracy and production rollout still require approval. Earlier entries below describe Phase 1.

# Approved asset provenance

Source: owner-supplied [Drive folder](https://drive.google.com/drive/folders/1GRRZgQN61mry20YFAut2ixFmSU9xAsSJ). All originals and the exact reference were visually inspected before implementation.

| Asset | Original dimensions | Source | SHA-256 |
| --- | --- | --- | --- |
| Exact hero reference | 1672×941 | [Drive](https://drive.google.com/file/d/12F4a_BJNqqz5jUb5w114R_PWJNXnPZLo/view) | `d919f9239dc9e97f70c1e99a7585d64039dd6bf887de2062f58feda7135cf740` |
| Afterglow original | 1000×753 | [Drive](https://drive.google.com/file/d/1SaEosn1dwZMbadMsT0Mn9FtuPAuHR1t7/view) | `e63b2a6dafbccd584dc32e856a65c48f75ba096090e946a3d46b0e0329ad69c5` |
| Colonial original | 960×677 | [Drive](https://drive.google.com/file/d/1am0L_DTV9bXWNnMh7MH3JPauFy97VMr0/view) | `9c2e2635295824469ebe0eb9557ca505ca86a37a82b4c2a249862527b9295dee` |

## Public derivatives

Afterglow: `assets/signature/afterglow-{480,768,1000}.webp`; Colonial: `assets/signature/colonial-{480,768,960}.webp`. Source dimensions cap the output; no upscaling or generative processing. The browser uses responsive cropping and CSS forest-green gradients.

Derivative recipe (Pillow): RGB conversion; contrast 1.07 Afterglow / 1.025 Colonial; color 1.03; brightness 1.025; UnsharpMask radius 1, percent 40, threshold 4; Lanczos downsampling; WebP quality 88. Architecture, landscaping and objects are unchanged. The original Afterglow is visibly soft at large desktop sizes. A higher-resolution authorized original would improve sharpness; the reference rendering is not a replacement photograph.

The exact reference is saved in `references/04-approved-hero-exact-reference.png` for cross-account review only and is excluded from deployed assets. Its alternate logo/house details are not copied into the public implementation. The existing supplied Oaktown JPG logo is unchanged.

The decorative footer SVG is a simplified riverfront illustration; it is not a property photograph. Existing Louisville photography remains attributed to King of Hearts / Wikimedia Commons under CC BY-SA 4.0. Lobster Nirvana uses the existing genuine local assets.

Existing file-catalogue property photo URLs, rent, deposit, availability and records are unchanged. Squarespace CDN requests remain blocked by the workspace network policy (proxy CONNECT 403). Do not treat the missing-photo collection/detail screenshots as final photo verification.

Before production deployment: owner confirms Afterglow ownership/management status and photograph reuse authorization. Afterglow is not added as a rental listing.
