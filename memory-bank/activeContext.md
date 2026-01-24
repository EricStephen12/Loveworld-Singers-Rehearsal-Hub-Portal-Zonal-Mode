## Active Context

- **Current focus**: Harden the media experience: clean build-blocking JSX, switch `react-player` import to the supported entry, allow admins to register either Cloudinary videos or straight YouTube links, and wire the HQ admin media uploader into a dedicated `video-upload` Firestore collection.
- **State**: `CustomVideoPlayer` uses the default `react-player` export; duplicate JSX removed from media pages/cards; `MediaUploadSection` now persists into the new `video-upload` collection via `videoUploadService`, supports dual source types, and surfaces recent uploads; player/card/hero read the `youtubeUrl` metadata; targeted linting passes.
- **Next steps**:
  1. Run `next build` with Turbopack when you're ready to confirm all module resolution and syntax fixes.
  2. QA the new YouTube flow (admin upload → media listing → playback) to ensure Firestore records contain `isYouTube`, `youtubeUrl`, and render/play correctly.

