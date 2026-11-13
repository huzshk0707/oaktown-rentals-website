# 115 Colonial Drive — Facebook video project

## Resume here

**Status:** storyboard and renderer prepared; final property video has not been rendered.
**Branch:** `marketing/115-colonial-video`.
**Next step:** obtain the original property photos, visually review them, and assign six photos in `storyboard.json`.

The website's 14 photo URLs are preserved in `photo-sources.json`. This cloud workspace could not fetch them because its network policy blocks `images.squarespace-cdn.com` (HTTP CONNECT 403). Obtain the photos from the owner or download them on a machine with access. Do not substitute photographs of other properties.

The initial format is a proposed 36-second vertical Facebook Reel (1080 × 1920, 30 fps). A format preference was requested in chat and was pending when this project was prepared. The renderer currently supports vertical only. Each of six scenes lasts six seconds, including short fades. The original photos remain unchanged and fully visible against Oaktown green; captions and contact details sit inside conservative Reel margins. Preview in Facebook before publishing.

## What is ready

- `storyboard.json`: editable shot list, captions, durations, and contact details.
- `photo-sources.json`: all 14 source photo URLs from the website.
- `render.py`: repeatable silent H.264 MP4 export with captions and fades.
- `copy.md`: optional narration and Facebook post copy.

## Continue from another computer or chat

```sh
git fetch origin
git switch marketing/115-colonial-video
```

Tell the next assistant: **“Continue the 115 Colonial Drive video from marketing/115-colonial-drive/README.md on marketing/115-colonial-video.”**

1. Put original photographs in this folder's `source-photos/` directory (ignored by Git).
2. Inspect the photographs. Set each scene's `image` to its matching relative path, for example `source-photos/exterior.jpg`. All image assignments intentionally start as null to prevent guessing which room appears in each numbered source image. Mark reviewed source entries in the manifest.
3. Check current property facts with the owner. The website lists 3 bedrooms, 1 bathroom, original oak floors, an open kitchen/dining/living layout, and a detached two-car garage in St. Matthews. Rent and current availability are not included in this video because they have not been reconfirmed.
4. Install Python 3 and FFmpeg with libx264 and drawtext support. The default font path works on this Linux workspace; on another machine pass `--font /path/to/a/font.ttf`.
5. Validate and render from the repository root:

```sh
python3 marketing/115-colonial-drive/render.py --check --output work/115-colonial-v1.mp4
python3 marketing/115-colonial-drive/render.py --output work/115-colonial-v1.mp4
```

The renderer refuses missing photos and existing output filenames. Use `v2`, `v3`, etc. to preserve revisions. Rendered video and original media remain outside version control. Keep source photos in shared storage or Git LFS if they need to travel between machines; a Git pull alone does not restore ignored files.

6. Watch the full export, verify room/caption matches, legibility and contact number, then preview its crop in Facebook. Add optional music from Facebook's available music library or provide an audio track you can use. No audio track is included in the current renderer.
7. Update the status above with the chosen photos, output location, edits requested, and next step. Commit those notes so another session can resume.

No website pages are changed. The existing `.assetsignore` excludes `marketing/`, so these working files are not public website assets. Main-branch pushes trigger website deployment; keep video work on this branch while iterating.

## Validation completed

A two-scene, two-second smoke export using the repository logo as test input passed: H.264, 1080 × 1920, 30 fps, yuv420p, two-second duration. A frame was visually checked for text placement. The production storyboard correctly refuses to render while photo assignments are empty. The logo-only test is not the property video and is not included in Git.
