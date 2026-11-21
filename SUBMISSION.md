# Kiroween submission materials

## Devpost project fields

- Project name: VoxBridge Live
- Tagline: A Swedish-to-Arabic dubbing studio for workshop briefings.
- Category: Frankenstein
- Application: https://voxbridge-live.vercel.app/
- Source: https://github.com/MudherAhmad/voxbridge-live

### Project description

A morning workshop briefing can contain details you need to hear the first time. VoxBridge Live puts a Swedish briefing and its Arabic dub on one timeline so viewers can follow the handoff between languages and read the technical terms in both captions.

The built-in sample plays each complete Swedish sentence followed by its Arabic translation. Listeners can isolate either track, change each track's speed and level, switch voices, and pause and resume at the same point. The sample works on desktop and mobile without an account. On desktop Chrome, VoxBridge can also receive audio from another browser tab with the user's permission. Live recognition, translation and narration depend on the browser's services.

### Testing instructions

1. Open the application and select **Play workshop sample**. Follow the playhead as it moves between Swedish and Arabic.
2. Try **Arabic only** or **Swedish only**, then use **Audio tuning** to compare voices and set a separate speed for each track.
3. Pause and resume playback to verify that the playhead continues from the same position.
4. For live capture on desktop Chrome, open a second tab with a Swedish video. The [Swedish workshop clip from the demo](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-final/Workshop-Briefing-SV.mp4) is available as a test source. Select **Capture tab audio** in VoxBridge, then share the source tab with its audio. Select **Enable live dubbing** in the Arabic track and wait for the listening status before playing the clip. The Swedish waveform shows incoming audio. The Arabic indicator moves while an installed Arabic browser voice is speaking.

### How we used Kiro

We used Kiro CLI with the project's steering and spec files to define and implement recovery from an individual translation error and preserve audible Swedish when switching from an Arabic-only sample mix to live capture. Kiro edited the code, wrote browser regressions, and ran the audio tests, TypeScript check, and build. A separate Kiro CLI V3 run confirmed that the save hook triggers the audio tests. The [Kiro development record](KIRO.md) links the requirements, edits, and verification.

## Video upload copy

- [Download the narrated demo with the Kiro chapter](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-kiro-review/VoxBridge-Kiroween-Kiro.mp4)
- YouTube title: VoxBridge Live | Swedish-to-Arabic Workshop Dubbing | Kiroween 2026
- YouTube description: Follow an Arabic-speaking technician through a Swedish workshop briefing. The showcase plays the built-in sample, changes listening modes, and records live Chrome translation and speech from a second tab. A labeled browser test demonstrates captions when an Arabic voice is unavailable. See how Kiro helped the studio recover from a failed translation and restore audibility on capture. Try it at https://voxbridge-live.vercel.app/ and see the source at https://github.com/MudherAhmad/voxbridge-live.
- Visibility: Public. Add the resulting YouTube link to the Devpost form.

## Submission status

- The website, source code, license, instructions, root `.kiro` materials, and downloadable demo are available.
- The [Kiro development record](KIRO.md) documents the authenticated CLI session, code and spec edits, and verification. The narrated demo includes a Kiro chapter.
- The bundled sample, desktop tab capture, and live Swedish-to-Arabic voice output have been verified. The live test used desktop Chrome on Windows with the Microsoft Naayf Arabic voice installed. Devices without an Arabic browser voice show live Arabic subtitles.
- A separate Edge profile on the same Windows computer played the packaged Arabic track, paused, resumed, and acquired tab audio. Its translation model timed out during setup. The supported live release target is desktop Chrome.
- The no-voice test supplies a controlled bilingual phrase through the studio, verifies the visible recovery instruction, retains captions, disables **Arabic only**, and checks that the original audio stays at its set level.
- The [independent review](AUDIT.md) records the source, media, test results, and remaining eligibility checks.
- The recorded voice permissions, public YouTube upload, and formal Devpost submission are pending. The entry deadline is **December 4, 2026 at 23:00 Sweden time**. The entrant or team representative confirms the entry details and declarations.

[Official Kiroween rules](https://kiroween.devpost.com/rules)
