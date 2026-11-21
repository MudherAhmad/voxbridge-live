# How Kiro helped build VoxBridge Live

On November 21, 2026, we used Kiro CLI 3.5.0 in an isolated checkout of VoxBridge Live. The starting revision was [3bdcff7](https://github.com/MudherAhmad/voxbridge-live/commit/3bdcff72fbe502ad3e7d1a58f6a427860b881091). We asked the agent to read the [steering instructions](.kiro/steering/project-rules.md) and the existing [spec](.kiro/specs/live-dub/requirements.md), write acceptance criteria, implement two reliability fixes, and add browser regressions. The website continues to use browser speech APIs and Web Audio. Kiro supported development.

| What the reviewer can check | What Kiro contributed |
| --- | --- |
| One phrase fails to translate during a live session | Kiro updated [the live speech pipeline](src/audio/liveSpeech.ts) to keep recognition running and continue with the next phrase. A review pass refined status recovery and retained the previous caption. |
| A viewer uses Arabic-only in the sample, then starts capture | Kiro updated [the studio](src/Studio.tsx) to restore an audible source level after capture succeeds. A cancelled share retains the sample setting. |
| The two changes have explicit acceptance criteria | Kiro edited the [requirements](.kiro/specs/live-dub/requirements.md) and [tasks](.kiro/specs/live-dub/tasks.md), then wrote both [browser regression tests](tests/browser/studio.spec.mjs). The final review tightened the controlled inputs and assertions. |

This short excerpt comes from the authenticated Kiro CLI session. Paths are shown relative to the repository.

```text
[tool] Reading requirements.md:1, design.md:1, tasks.md:1, test-on-save.json:1
[tool] Editing requirements.md
[tool] Editing tasks.md
[tool] Editing liveSpeech.ts
[tool] Editing Studio.tsx
[tool] Editing studio.spec.mjs
```

In the first run, Kiro explicitly ran `npm test` (5/5), `npm run typecheck`, and `npm run build` on Linux. The follow-up included independent code review and all 15 browser tests passed on Windows. The two new browser regressions failed against the earlier code. The old translation error required a restart, and capture showed the original at 0% after using Arabic-only. The property tests cover serial dub playback, queue cancellation, caption history, and ducking.

To verify automatic execution, we launched Kiro CLI with `--v3` in a disposable checkout. We kept the [PostFileSave trigger and file matcher](.kiro/hooks/test-on-save.json), routed its test command through a logger, and asked Kiro to edit a single existing TypeScript file using only file tools. Kiro saved the file and the hook ran `npm test`. The output recorded five passed tests and exit code 0. The logger and probe edit stayed outside the shipped changes.

```text
PostFileSave executed
ℹ tests 5
ℹ pass 5
ℹ fail 0
npm test exit: 0
```

## Workshop glossary follow-up

A later Kiro CLI V3 session began at [92cadca](https://github.com/MudherAhmad/voxbridge-live/commit/92cadcafdfa484173bd63f281428ec0a53ae751f). Kiro read the existing spec and steering, wrote glossary acceptance criteria, implemented the bilingual list and Swedish term matcher, and added browser and matcher cases. It reused the studio's three existing term pairs and its finalized translation callback. Independent review consolidated the regression cases and verified matching across Unicode normalization and whitespace, first-heard order within a single phrase, and retention through a failed phrase.

[Watch the narrated film with the Kiro chapter](https://github.com/MudherAhmad/voxbridge-live/releases/download/kiroween-submission/VoxBridge-Kiroween-Submission.mp4) · [Kiro Hooks documentation](https://kiro.dev/docs/hooks/)
