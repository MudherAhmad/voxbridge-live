# Kiroween submission materials

## Devpost project fields

- Project name: VoxBridge Live
- Tagline: Hear a Swedish workshop briefing, follow it in Arabic, and check the terms that matter.
- Category: Frankenstein
- Application: https://voxbridge-live.vercel.app/
- Source: https://github.com/MudherAhmad/voxbridge-live

### Project description

In a Swedish workshop, the morning briefing names the first job and where the customer is waiting. VoxBridge Live helps an Arabic-speaking technician follow those details. One studio brings together the Swedish source, Arabic captions and speech, and a small bilingual reference for terms such as *arbetsordern* and *أمر العمل*.

**Try the bundled briefing** on desktop or mobile with no account or API key. Each Swedish sentence finishes before its Arabic counterpart starts. Compare listening modes, change speeds independently from 0.75× to 1.50×, compare three Swedish and five Arabic playback styles, and pause and resume on one playhead. The glossary identifies the current sample cue.

**Share a live tab** on desktop Chrome. VoxBridge combines consented tab capture, Web Audio, Swedish speech recognition, on-device Chrome translation of finalized phrases, and available browser Arabic voices. A serialized queue plays the dub. When the browser supports source suppression, Web Audio lowers the Swedish mix while the Arabic voice plays. If a browser voice is unavailable, the conversation is still readable in Arabic. The curated glossary adds terms recognized in the Swedish source and keeps their first-heard order for the current share.

**Frankenstein architecture** brings together two workflows with the same interface. The portable sample uses offline-rendered WAV assets and a timed bilingual script. Live capture uses browser language APIs and an explicit consent step. The app has no server-side capture storage. Browser speech recognition may use its provider's online service.

**Next step** is a consented pilot with bilingual technicians or vocational learners to measure comprehension, terminology accuracy and time to the first translated caption.

### Testing instructions

1. Open the application and select **Play workshop sample**. Follow the playhead as it moves between Swedish and Arabic.
2. Try **Arabic only** or **Swedish only**, then use **Audio tuning** to compare voices and set a separate speed for each track. Find the highlighted cue in **Workshop terms** below the captions.
3. Pause and resume playback to verify that the playhead continues from the same position.
4. On desktop Chrome, open the [Swedish workshop clip](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-final/Workshop-Briefing-SV.mp4) in a second tab. In VoxBridge, select **Capture tab audio** and share that tab with its audio. Select **Enable live dubbing** and wait for the listening status before starting the clip. The Swedish waveform shows incoming audio. Look for an Arabic caption, a term pair, and an Arabic activity indicator if a browser voice is installed. On an eligible source route, the default mix falls from 40% to 4% during Arabic speech and recovers when the phrase ends.

### How we used Kiro

We used Kiro CLI with the project's steering and spec files to turn three behaviors into concrete acceptance criteria. One rejected phrase keeps the previous caption visible and the recognizer running. Entering live capture after an Arabic-only sample starts with audible Swedish. A term appears only when it matches the recognized Swedish phrase. Kiro edited the specs and implementation, wrote tests, and ran the audio suite, type check and build. A separate instrumented Kiro CLI V3 run confirmed that the save hook triggered the audio checks. Property-based tests cover cue sequencing, serialized speech and bounded caption history. The [Kiro development record](KIRO.md) links the requirements, edits, and verification.

## Video upload copy

- [Download the narrated submission film](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-submission/VoxBridge-Kiroween-Submission.mp4)
- YouTube title: VoxBridge Live | Swedish-to-Arabic Workshop Dubbing | Kiroween 2026
- YouTube description: Follow an Arabic-speaking technician through a Swedish workshop briefing. Try independent playback speeds and the bilingual glossary. Live capture visuals show real Chrome captions. The film recreates that Arabic soundtrack with Nabra-82M INT8, and labels the simulated missing-voice test separately. See how Kiro helped build the glossary and protect live recovery. Try the studio at https://voxbridge-live.vercel.app/ and see the source and media credits at https://github.com/MudherAhmad/voxbridge-live.
- Visibility: Public. Add the resulting YouTube link to the Devpost form.

## Submission status

- The website, source code, license, instructions, root `.kiro` materials, and downloadable demo are available.
- The [Kiro development record](KIRO.md) documents the authenticated CLI session, code and spec edits, and verification. The narrated demo includes a Kiro chapter.
- The bundled sample, desktop tab capture, and live Swedish-to-Arabic voice output have been verified. The live test used desktop Chrome on Windows with the Microsoft Naayf Arabic voice installed. Devices without an Arabic browser voice show live Arabic subtitles.
- A separate Edge profile on the same Windows computer played the packaged Arabic track, paused, resumed, and acquired tab audio. Its translation model timed out during setup. The supported live release target is desktop Chrome.
- The no-voice test supplies a controlled bilingual phrase through the studio, verifies the visible recovery instruction, retains captions, disables **Arabic only**, and checks that the original audio stays at its set level.
- The [independent review](AUDIT.md) records the source, media, test results, and remaining eligibility checks.
- The submission film replaces the earlier system-voice soundtrack with documented Nabra synthesis. The public YouTube URL and Devpost receipt are pending. The deadline is **December 4, 2026 at 23:00 Sweden time**. The entrant or team representative confirms the entry details and declarations.

[Official Kiroween rules](https://kiroween.devpost.com/rules)
