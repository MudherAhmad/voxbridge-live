# VoxBridge Live independent review

Reviewed November 21, 2026 in Sweden. This report records evidence for a new review of the product, documentation, film, and submission. It covers the public VoxBridge Live repository, which is a separate project from Car Care Sverige.

- [Production studio](https://voxbridge-live.vercel.app/)
- [Public repository](https://github.com/MudherAhmad/voxbridge-live)
- [Narrated demo with the Kiro chapter](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-final-review/VoxBridge-Kiroween-Final-Review.mp4)
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
| Workshop glossary | Kiro added requirements and implementation for the curated reference. Match tests cover Swedish Unicode, boundaries, and term order. Browser tests cover the sample cue, same-share deduplication and recovery, rejection of a longer word, and reset on a new share. The expanded suite passed 18/18 browser and 8/8 unit and property tests. Typecheck and production build passed. |

## What the product delivers

The sample and live capture are two paths through the same studio. Sample waveforms use peaks measured from the bundled recordings. Live Swedish shows signal from the shared track and live Arabic shows activity from synthesis events. Live source ducking is available when the browser confirms original playback suppression. The fallback keeps the source controlled by its own tab.

On desktop Chrome, the live flow is share tab audio, enable live dubbing, capture finalized Swedish phrases, translate them using the built-in Translator, and speak them with an available Arabic browser voice. Initial model setup varies by device. The speech recognition service may process shared audio online. The app has no capture storage backend. It retains up to three translated pairs in session memory for captions. Translation is phrase by phrase. The serial Arabic queue catches up by increasing rate and discards older waiting utterances above its pending limit. Sustained backlog can therefore leave some phrases caption-only.

The requirements and design describe the shipped Swedish-to-Arabic workflow and mark contextual translation, explicit VAD segmentation, neural live synthesis, and additional language pairs as future scope. Live tab audio on iPhone or Android falls outside the documented target. Start with the packaged sample when judging from a phone.

## Video and media

The submission film shows real application footage and a labeled recording of a live Chrome capture. The two live-caption scenes use freshly rendered Nabra-82M INT8 audio from the displayed Arabic text. Every live-capture audio stream in the edit is replaced by original workshop audio or newly generated narration and Arabic speech. Earlier review cuts included a recorded system voice. The missing-voice scene is labeled as a simulation. The Kiro chapter shows excerpts from the glossary specification and matcher, the recorded save-hook output, and a controlled browser regression.

The workshop script, recordings and visuals were created for this project. The Swedish sample uses [Piper NST](https://huggingface.co/rhasspy/piper-voices/blob/main/sv/sv_SE/nst/medium/MODEL_CARD), whose model card lists CC0 training data. The Arabic sample and the recreated soundtrack use [Nabra-82M INT8](https://huggingface.co/marwanelamami/nabra-82m-sherpa-onnx/tree/7fe12ea), listed as Apache-2.0 by its publisher. English narration uses [Piper LJSpeech](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/medium/MODEL_CARD), whose card identifies public-domain training data. The submission film uses no recorded system-voice audio. Source references for the optional bundled voices appear in the [README](README.md). MIT covers project code.

## Submission status

The public source, MIT license, root Kiro files, live site, and downloadable video are available. The [submission materials](SUBMISSION.md) include draft fields and the reproducible testing instructions.

The entrant authorized Kiro CLI, and Kiro implemented [two live reliability improvements and the workshop glossary](KIRO.md). The [contest review](CONTEST.md) provides the rules checklist and the sources behind the positioning. The [YouTube demo](https://youtu.be/l0ngeda9I2E) is published. The Devpost submission receipt is pending. The verified deadline is **December 4, 2026 at 23:00 in Sweden**.

The [official rules](https://kiroween.devpost.com/rules) screen theme fit and meaningful Kiro use before scoring. The five scored criteria are impact, technological implementation, design, innovation, and presentation, at 20% each. The November 20 public repository date is within the submission window. The entrant must still confirm project provenance, any incorporated pre-existing work, team eligibility, and media permissions. A numeric score for the demo cannot establish eligibility.

## Questions for a second reviewer

1. Can you understand the workshop problem, test the sample, and reproduce the desktop capture path using only the supplied material?
2. Where does a README or spec claim exceed the referenced code or test evidence? Identify the file and sentence.
3. While watching, can you distinguish the built-in sample, the real two-phrase capture, and the simulated missing-voice case? Give timestamps for any ambiguous moment.
4. Score the film, product, documentation, and submission readiness separately. For each deduction, cite evidence and identify the smallest fix that can be checked.
5. Treat eligibility checks, actual Kiro use, media rights, public video, and Devpost submission as separate gates with their own evidence.
