# Kiroween submission materials

## Devpost project fields

- Project name: VoxBridge Live
- Tagline: Hear a Swedish workshop briefing in Arabic and check the terms you need on the job.
- Category: Frankenstein
- Application: https://voxbridge-live.vercel.app/
- Source: https://github.com/MudherAhmad/voxbridge-live

### Project description

**Try the workshop briefing.** Open [VoxBridge Live](https://voxbridge-live.vercel.app/) and select **Play workshop sample**. It works on desktop and mobile with no account or API key.

VoxBridge Live helps an Arabic-speaking technician follow a Swedish morning briefing. Hear the original, follow the Arabic captions and dub, and check terms such as *arbetsordern* and *أمر العمل*. To go live, share the [Swedish workshop clip](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-final/Workshop-Briefing-SV.mp4) with tab audio in desktop Chrome and select **Enable live dubbing**.

**In the sample**, each Swedish sentence finishes before its Arabic counterpart starts. Compare listening modes, set each language's speed independently, switch playback styles, or pause and resume on one playhead. The glossary highlights the current cue.

**The live path** combines tab capture, Web Audio, Swedish speech recognition, Chrome's on-device translation of finalized phrases, and browser voices in a serialized queue. On supported source routes, the Swedish mix lowers while Arabic plays. When an Arabic voice is unavailable, Arabic captions stay visible. The glossary lists recognized Swedish terms in first-heard order. Capture requires explicit consent, and the app stores no captured audio on a server. Browser speech recognition may use its provider's online service.

**Next step** is a consented pilot with bilingual technicians or vocational learners to measure comprehension, terminology accuracy and time to the first translated caption.

### Testing instructions

1. Open the application and select **Play workshop sample**. Follow the playhead as it moves between Swedish and Arabic.
2. Try **Arabic only** or **Swedish only**, then use **Audio tuning** to compare voices and set a separate speed for each track. Find the highlighted cue in **Workshop terms** below the captions.
3. Pause and resume playback to verify that the playhead continues from the same position.
4. On desktop Chrome, open the [Swedish workshop clip](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-final/Workshop-Briefing-SV.mp4) in a second tab. In VoxBridge, select **Capture tab audio** and share that tab with its audio. Select **Enable live dubbing** and wait for the listening status before starting the clip. The Swedish waveform shows incoming audio. Look for an Arabic caption, a term pair, and an Arabic activity indicator if a browser voice is installed. On an eligible source route, the default mix falls from 40% to 4% during Arabic speech and recovers when the phrase ends.

### How we used Kiro

We used Kiro CLI with the project's steering and spec files to turn three behaviors into concrete acceptance criteria. One rejected phrase keeps the previous caption visible and the recognizer running. Entering live capture after an Arabic-only sample starts with audible Swedish. A term appears only when it matches the recognized Swedish phrase. Kiro edited the specs and implementation, wrote tests, and ran the audio suite, type check and build. A separate instrumented Kiro CLI V3 run confirmed that the save hook triggered the audio checks. Property-based tests cover cue sequencing, serialized speech and bounded caption history. The [Kiro development record](KIRO.md) links the requirements, edits, and verification.

## Video upload copy

- [Download the narrated submission film](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-final-review/VoxBridge-Kiroween-Final-Review.mp4)
- Visibility: Public. Add the resulting YouTube link to the Devpost form.

### YouTube title

VoxBridge Live — Kiroween 2026 Submission Demo (Swedish → Arabic Workshop Briefing)

### YouTube description

Try the workshop briefing at https://voxbridge-live.vercel.app/ and select Play workshop sample. No account or API key is needed.

A practical walkthrough of VoxBridge Live, built for a Swedish-speaking workshop briefing where an Arabic-speaking technician needs clear instructions, synchronized captions/dubbing, and quick bilingual workshop terms.

What’s shown in this demo:

- Bundled workshop sample & independent Swedish / Arabic playback speed controls
- Listening modes (Balanced mix, Arabic only, Swedish only) and automatic original audio ducking (40% → 4% during Arabic playback)
- Swedish–Arabic workshop glossary appearing in order of recognized terms without duplicates (e.g., arbetsordern, receptionen)
- Live tab audio capture flow in desktop Chrome
- Resilience & fallback tests: missing Arabic TTS voice fallback and single-phrase translation failure recovery while keeping prior captions and continuing the session
- Kiro workflow, steering, property tests, and PostFileSave hook verification

Transparency note: Live capture and translation UI sequences are from recorded browser runs; the Arabic dubbing soundtrack in this film was regenerated with Nabra-82M INT8 for clear presentation.

- GitHub repository: https://github.com/MudherAhmad/voxbridge-live
- Kiro log: https://github.com/MudherAhmad/voxbridge-live/blob/main/KIRO.md
- Contest report: https://github.com/MudherAhmad/voxbridge-live/blob/main/CONTEST.md

## Submission status

- The website, source code, license, instructions, root `.kiro` materials, and downloadable demo are available.
- The [Kiro development record](KIRO.md) documents the authenticated CLI session, code and spec edits, and verification. The narrated demo includes a Kiro chapter.
- The bundled sample, desktop tab capture, and live Swedish-to-Arabic voice output have been verified. The live test used desktop Chrome on Windows with the Microsoft Naayf Arabic voice installed. Devices without an Arabic browser voice show live Arabic subtitles.
- A separate Edge profile on the same Windows computer played the packaged Arabic track, paused, resumed, and acquired tab audio. Its translation model timed out during setup. The supported live release target is desktop Chrome.
- The no-voice test supplies a controlled bilingual phrase through the studio, verifies the visible recovery instruction, retains captions, disables **Arabic only**, and checks that the original audio stays at its set level.
- The [independent review](AUDIT.md) records the source, media, test results, and remaining eligibility checks.
- The submission film replaces the earlier system-voice soundtrack with documented Nabra-82M INT8 synthesis. The public YouTube URL and Devpost receipt are pending. The deadline is **December 4, 2026 at 23:00 Sweden time**. The entrant or team representative confirms the entry details and declarations.

[Official Kiroween rules](https://kiroween.devpost.com/rules)
