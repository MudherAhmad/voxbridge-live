# VoxBridge Live

A browser-based dubbing studio for multilingual workshops. The first supported product scenario is a Swedish workshop briefing with Arabic captions and audio.

[Open VoxBridge Live](https://voxbridge-live.vercel.app/) · [Watch the narrated demo](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-polished/VoxBridge-Kiroween-Polished.mp4) · [How Kiro helped](KIRO.md) · [Independent review](AUDIT.md) · [Kiroween submission materials](SUBMISSION.md)

Try the sample on desktop or mobile. Live tab capture targets desktop Chrome.

The narrated demo introduces the workshop, shows the built-in sample and mixer, and explains tab capture. The actual capture comes from a second tab playing [the Swedish workshop clip](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-final/Workshop-Briefing-SV.mp4). The recording includes two live Arabic phrases spoken by Microsoft Naayf. A labeled browser test shows captions when an Arabic voice is unavailable. The closing chapter shows how Kiro helped specify and implement two live reliability improvements.

## Run locally

Requires Node.js 24 and npm. Chrome is required for the included browser tests.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Select **Play workshop sample** to hear the bundled tracks. Open **Audio tuning** for the volume, ducking, speed, and voice settings. The **Original volume** and **Arabic volume** faders control the two tracks independently. Use **Arabic only** and **Swedish only** to isolate a track during playback, or select **Balanced mix** to restore the default track levels. The faders also allow custom levels. Choose **Swedish speed** and **Arabic speed** independently from 0.75× to 1.50× before or during playback. The two tracks share one visible playhead and have separate pitch-preserving playback rates. On compatible media engines the player downloads the selected tracks before playback and uses local audio blobs for seeking. The native media URL remains available as a compatibility fallback. It finishes both parts of a sentence before advancing to the next caption pair. **Pause sample** keeps the current position and **Resume sample** continues from it. **Reset sample** returns to the beginning. Select a **Voice style** before or during playback, including while paused. Changes take effect at the next phrase for that language. Swedish offers the original, an alternate woman’s voice, and a youthful tone. Arabic additionally offers deep adult and mature tones. The three tone treatments use the original synthetic voice. The alternate voices are distinct synthesized speakers from [Piper Lisa](https://huggingface.co/rhasspy/piper-voices/commit/be719fadaa7524f77a9e64e874751fbb86fcbb0b) and [Arabic Emirati Female Piper](https://huggingface.co/vadimbelsky/arabic-emirati-female-piper). For live capture, change the source speed in the original tab’s player. The live Arabic voice still comes from the browser. In the sample each Swedish sentence finishes before Arabic starts. The original level defaults to 40%. The captions highlight terminology such as “arbetsordern” and “أمر العمل”.

**Capture tab audio** opens the desktop browser share picker. Choose a tab and enable **Share tab audio**, then select **Enable live dubbing**. Use current desktop Chrome with the Translator API available. The first run may download the Swedish-to-Arabic model. Wait until the studio is listening, then play Swedish speech in the source tab. If download progress stalls for 60 seconds, select **Enable live dubbing** to retry while the source stays shared. The studio displays Arabic captions and uses an available Arabic browser voice. Untick **Arabic voice** or set Arabic volume to zero for subtitles only. Zero cancels speech immediately. Arabic voice and nonzero level changes apply to the next phrase. The original fader requires Chrome to confirm local source suppression. Ducking also requires live dubbing and Arabic voice to be enabled.

The live browser speech recognizer may send your shared audio to its online recognition service. Translation uses the browser model. VoxBridge itself stores no captured media or credentials. Stop capture to end recognition, cancel synthesis, and release the shared tracks.

The bundled sample uses pretranslated text and synthesized audio, with Web Audio doing the mixing during playback. It needs no language model or installed voice.

## Verification

```sh
npm run typecheck
npm test
npm run test:browser
npm run build
```

The automated tests cover sample playback and timeline, live queue ordering and cancellation, and the three-segment history limit. Chrome integration tests inject controlled speech, translation and synthesis providers to verify live caption rendering and ducking. A separate Chrome test shares a real tab, checks for incoming waveform energy, and verifies track release on stop. Desktop, Arabic playback and mobile screenshots are stored under `test-results/`.

The built-in Translator API translates finalized recognition segments and has no prompt or context parameter. The session holds the last three translated pairs in memory. In a production test on desktop Chrome for Windows, VoxBridge captured a Swedish sentence from another tab, rendered its Arabic translation, and completed playback of that text using the installed Microsoft Naayf voice. Let the translation model finish preparing before starting the source audio. If Chrome has no Arabic voice, the studio displays live Arabic subtitles and identifies the unavailable voice in the Arabic track.

## Design and provenance

The two sample waveforms use measured peaks from the packaged PCM tracks. Each track has a pitch-preserving media element and a Web Audio gain stage. The sample plays each complete source phrase followed by its dub and advances the captions after both finish. In live mode, the Swedish waveform comes from captured audio and the Arabic activity meter follows browser speech events. Live ducking lowers the original while Arabic is speaking on browsers that confirm source suppression. The responsive layout stacks captions on narrow screens.

The workshop scenario, texts, timing and motion are specific to this project. The sample files were rendered locally with sherpa-onnx 1.12.40. The Swedish voice is [Piper NST](https://huggingface.co/rhasspy/piper-voices/blob/main/sv/sv_SE/nst/medium/MODEL_CARD) and the Arabic voice is [Nabra-82M INT8](https://huggingface.co/marwanelamami/nabra-82m-sherpa-onnx/tree/7fe12ea). The recordings were trimmed, level-matched, and exported as separate mono WAV files. The browser plays the packaged audio and uses no synthesis dependency or service to run the sample. The sample contains no Car Care customer data.

See [.kiro specs](.kiro/specs/live-dub/design.md) for design choices, [How Kiro helped](KIRO.md) for development evidence, and [the task record](.kiro/specs/live-dub/tasks.md) for remaining checks.

The [offline review packet](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-polished/VoxBridge-Gemini-Polished-Review.txt) includes the source text, test evidence, and film links.
