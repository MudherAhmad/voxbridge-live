# VoxBridge Live

Build a Swedish-to-Arabic workshop briefing studio. Target the built-in sample at desktop and mobile browsers, and live tab capture at desktop Chrome with tab audio sharing and the browser language APIs enabled.

1. Capture a selected tab with getDisplayMedia. Require an audio track, show a live waveform, and release tracks when sharing ends. Explain how to share tab audio when none is received.
2. Recognize Swedish from the shared track after explicit opt-in. Translate each finalized phrase with Chrome's Translator API. Display paired Swedish and right-to-left Arabic captions and keep the latest three translated pairs in session memory.
3. Use an available Arabic browser voice. Speak one phrase at a time and allow the rate to rise to 1.25× when the queue has more than two pending segments. Support subtitles-only playback and continue captions if an Arabic voice is unavailable. When local playback suppression is supported, replay original audio through a GainNode and attenuate it during Arabic speech.
4. Provide a clearly labeled prerecorded demo without API keys. Disclose that the browser's speech recognition provider may process captured audio online. Keep captured media out of app-server storage.
5. Test serial playback, the three-pair history, and ducking with property-based tests. Keep a Kiro save-hook configuration for the audio tests and document any actual runs in Kiro.
6. Publish a working judge demo and a public GitHub repository with an open-source license and the root .kiro directory. Disclose any reused work. Use workshop media the team owns or has permission to publish.

## Reliability requirements

7. When translation rejects an individual finalized phrase, keep the previous translated caption and history. Show that the phrase could not be translated, keep recognition running, and accept the next phrase. A later successful translation clears the temporary error even in subtitles-only mode.
   Acceptance: given a successful phrase, a controlled translation rejection, and another successful phrase, the first Arabic caption remains visible through the rejection and the latest Arabic caption appears without restarting or aborting recognition.

8. When a capture starts and the original gain is zero, use the 40% default so the source remains audible. Preserve custom nonzero values, and retain the saved sample mix if sharing is cancelled.
   Acceptance: after selecting Arabic-only, a cancelled share leaves the source level at 0%. Successful capture displays 40% and sets the original audio gain to 0.40 when the app can route the source.

## Future scope

Context-aware translation, explicit VAD segmentation, neural live synthesis, and additional language pairs are follow-up work. The three-pair history is used for session captions, and Chrome translates each finalized input phrase independently.
