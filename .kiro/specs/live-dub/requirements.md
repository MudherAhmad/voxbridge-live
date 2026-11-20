# VoxBridge Live

Build a browser app for multilingual workshop teams. Start with Swedish to Arabic and desktop Chrome or Edge. Expand to English, German, and Spanish after the core workflow is verified.

1. Capture a selected tab with getDisplayMedia. Require an audio track, show a live waveform, and release tracks when sharing ends. Explain how to share tab audio when none is received.
2. Segment speech with VAD or overlapping 2–4 second windows. Translate using the last three accepted segments as context. Display Arabic with right-to-left direction.
3. Play neural speech sequentially. When more than two segments are waiting, accelerate up to 1.25×. Allow switching to subtitles at any time. When local playback suppression is supported, replay original audio through a GainNode and duck it during dubbing.
4. Provide a clearly labeled prerecorded demo that needs no key. Document which data the live provider receives. Keep optional user credentials in browser storage and send them only to the selected provider. Do not persist captured media on the app server.
5. Verify with property-based tests that queue playback does not overlap and context never exceeds three segments. Use a Kiro hook to run the tests when Kiro edits the audio code.
6. Publish a working judge demo and a public GitHub repository with an open-source license and the root .kiro directory. Disclose any reused work. Use workshop media the team owns or has permission to publish.
