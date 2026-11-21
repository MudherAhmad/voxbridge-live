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

## Video upload copy

- [Download the 76-second demo MP4 with English narration](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-audit/VoxBridge-Kiroween-Narrated.mp4)
- YouTube title: VoxBridge Live | Swedish-to-Arabic Workshop Dubbing | Kiroween 2026
- YouTube description: Follow an Arabic-speaking technician through a Swedish workshop briefing. The showcase plays the built-in sample, changes listening modes, and records live Chrome translation and speech from a second tab. A labeled browser test demonstrates captions when an Arabic voice is unavailable. Try it at https://voxbridge-live.vercel.app/ and see the source at https://github.com/MudherAhmad/voxbridge-live.
- Visibility: Public. Add the resulting YouTube link to the Devpost form.

## Submission status

- The website, source code, license, instructions, root `.kiro` materials, and downloadable demo are available.
- The Kiro tooling statement is pending a documented development session. The repository contains specs, steering, and a save hook configuration prepared for that session.
- The bundled sample, desktop tab capture, and live Swedish-to-Arabic voice output have been verified. The live test used desktop Chrome on Windows with the Microsoft Naayf Arabic voice installed. Devices without an Arabic browser voice show live Arabic subtitles.
- A separate Edge profile on the same Windows computer played the packaged Arabic track, paused, resumed, and acquired tab audio. Its translation model timed out during setup. The supported live release target is desktop Chrome.
- The no-voice test supplies a controlled bilingual phrase through the studio, verifies the visible recovery instruction, retains captions, disables **Arabic only**, and checks that the original audio stays at its set level.
- The [independent review](AUDIT.md) records the source, media, test results, and remaining eligibility checks.
- The public YouTube upload and formal Devpost submission are pending. The entry deadline is **December 4, 2026 at 23:00 Sweden time**. The entrant or team representative confirms the entry details and declarations.

[Official Kiroween rules](https://kiroween.devpost.com/rules)
