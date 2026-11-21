# VoxBridge Live independent review

Reviewed November 21, 2026 in Sweden. This report records evidence for a new review of the product, documentation, film, and submission. It covers the public VoxBridge Live repository, which is a separate project from Car Care Sverige.

- [Production studio](https://voxbridge-live.vercel.app/)
- [Public repository](https://github.com/MudherAhmad/voxbridge-live)
- [Narrated demo with the Kiro chapter](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-polished/VoxBridge-Kiroween-Polished.mp4)
- [Kiro development and verification record](KIRO.md)
- [Official rules](https://kiroween.devpost.com/rules)

## What was checked

| Area | Evidence and result |
| --- | --- |
| Reproducible build | Cloned public commit `c2be1e4b64d26d556c120d1ac72b92db8ae9b5c2` into a fresh directory. `npm ci`, `npm run typecheck`, `npm test` (5/5), and `npm run build` succeeded. All 13 canonical build files matched the public Vercel deployment by SHA-256 at the time of the baseline review. |
| Browser checks | The first run passed 12 of 13. Chrome reported incoming audio, but the native-tab test timed out while checking for waveform energy from its test oscillator. The updated test plays the packaged Swedish speech from a second tab, checks for waveform energy from a real capture, and verifies that the shared audio track ends after stopping. The updated suite passed 13 of 13. |
| Sample playback | Browser tests cover the paired timeline, playback modes, pause and resume, voice switches, and a narrow WebKit layout. The sample plays every complete Swedish phrase before its Arabic dub. Bundled audio requires neither a model download nor an installed Arabic voice. Mobile coverage came from browser emulation. Physical iPhone and Android behavior remain to be verified on the updated build. |
| Live capture | A recorded production Chrome session on Windows shared a second tab and produced visible Arabic captions and audible Arabic on two phrases using Microsoft Naayf. In a separate Edge profile on the same computer, sample playback, pause/resume, and the native share picker worked. Edge's translation model did not prepare before the 30-second test timeout. A second physical computer and sustained live latency were outside the verified evidence. |
| Missing Arabic voice | Found that `Arabic only` could mute the original when no Arabic voice was available. The mode is now disabled in that state. The browser test injects deterministic language providers and verifies translated captions, missing-voice guidance, and source volume at the balanced level. The film labels this scene as a fallback test. |
| GitHub | Public access and MIT SPDX metadata verified. The five tracked Kiro files are at the root under `.kiro/` and are included in Git. License, README, submission materials, source and tests are present. No environment or credentials files with the checked names appeared in the tracked tree. This was a file inventory, with no claim of a full secret-history scan. |
| Updated production | Verified the public URL after publishing the missing-voice fix. The HTML, JavaScript, CSS, and ten WAV files each returned HTTP 200 and matched the updated local build by SHA-256 (13/13). |
| Kiro follow-up | Kiro updated the spec and implemented live translation recovery and source gain restoration on capture. Two new browser regressions failed on the previous code and passed after the fixes. The updated browser suite passed 15/15. The TypeScript check, five audio and property tests, and production build also passed. All 13 public production files matched the new build by SHA-256. |
| Reviewer follow-up | Added a visible next-phrase explanation for live voice selection. Tested both missing Arabic voices and the absence of the synthesis API. A stalled model now gets 60 seconds without advancing progress before offering a retry that retains tab sharing. The controlled timeout and retry regression passed. The full browser suite passed 16/16, the audio suite passed 5/5, and typecheck and build succeeded. |

## What the product delivers

The sample and live capture are two paths through the same studio. Sample waveforms use peaks measured from the bundled recordings. Live Swedish shows signal from the shared track and live Arabic shows activity from synthesis events. Live source ducking is available when the browser confirms original playback suppression. The fallback keeps the source controlled by its own tab.

On desktop Chrome, the live flow is share tab audio, enable live dubbing, capture finalized Swedish phrases, translate them using the built-in Translator, and speak them with an available Arabic browser voice. Initial model setup varies by device. The speech recognition service may process shared audio online. The app has no capture storage backend. It retains up to three translated pairs in session memory for captions. Translation is phrase by phrase. The serial Arabic queue catches up by increasing rate and discards older waiting utterances above its pending limit. Sustained backlog can therefore leave some phrases caption-only.

The requirements and design describe the shipped Swedish-to-Arabic workflow and mark contextual translation, explicit VAD segmentation, neural live synthesis, and additional language pairs as future scope. Live tab audio on iPhone or Android falls outside the documented target. Start with the packaged sample when judging from a phone.

## Video and media

The early 78-second cut had approximately eight seconds of opening silence, an internal gap near twelve seconds, and a closing silent stretch over sixteen seconds. The latest cut is 87.91 seconds. It keeps the original live audio, replaces rapid switches with a labeled split view of the source and studio, shows the enable control and ready state, and explains why the Swedish mix drops from 40% to 4% in the recording. The no-voice scene is labeled and narrated as a simulation. The closing chapter describes the actual Kiro development work and save-hook check. FFmpeg decoded the complete film. The longest interval under −45 dB was 1.43 seconds.

The original workshop script and visuals are project material. Source references for the packaged and alternate voices appear in the [README](README.md). [Piper NST](https://huggingface.co/rhasspy/piper-voices/blob/main/sv/sv_SE/nst/medium/MODEL_CARD) lists CC0 training data. The [Nabra INT8 model](https://huggingface.co/marwanelamami/nabra-82m-sherpa-onnx/tree/7fe12ea) lists Apache-2.0. English narration uses [Piper LJSpeech](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/medium/MODEL_CARD), whose card identifies public-domain training data. Repository MIT licensing covers project code. The voice-model metadata was checked separately. Public-use rights for the recorded Microsoft Naayf output remain to be confirmed by the entrant before final contest submission.

## Submission status

The public source, MIT license, root Kiro files, live site, and downloadable video are available. The [submission materials](SUBMISSION.md) include draft fields and the reproducible testing instructions.

The initial audit found a signed-out desktop session. In the follow-up, the entrant authorized Kiro CLI and Kiro implemented [two live reliability improvements](KIRO.md). Confirm the recorded media rights before final publication. A public YouTube URL and a submitted Devpost entry remain outstanding. The verified deadline is **December 4, 2026 at 23:00 in Sweden**.

The [official rules](https://kiroween.devpost.com/rules) screen theme fit and meaningful Kiro use before scoring. The five scored criteria are impact, technological implementation, design, innovation, and presentation, at 20% each. The November 20 public repository date is within the submission window. The entrant must still confirm project provenance, any incorporated pre-existing work, team eligibility, and media permissions. A numeric score for the demo cannot establish eligibility.

## Questions for a second reviewer

1. Can you understand the workshop problem, test the sample, and reproduce the desktop capture path using only the supplied material?
2. Where does a README or spec claim exceed the referenced code or test evidence? Identify the file and sentence.
3. While watching, can you distinguish the built-in sample, the real two-phrase capture, and the simulated missing-voice case? Give timestamps for any ambiguous moment.
4. Score the film, product, documentation, and submission readiness separately. For each deduction, cite evidence and identify the smallest fix that can be checked.
5. Treat eligibility checks, actual Kiro use, media rights, public video, and Devpost submission as separate gates with their own evidence.
