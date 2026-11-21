# Kiroween 2026 review and submission checklist

## What we learned from prior competitions

| Published project or event | Design decision for VoxBridge |
| --- | --- |
| [InteractionKit, 2025 first overall](https://devpost.com/software/kiro-interactionkit) demonstrated one computer-vision foundation in two working applications. Its public write-up traced individual Kiro features to specific development work. | Show the instrumented Kiro save hook, an acceptance criterion, and the behavior it protects. Give a judge one complete workflow to test. |
| [UnitSet, 2025 second overall](https://devpost.com/software/unitset) combined a canvas, code, AI and sandbox execution in one workflow. Its author reported that depleted API credits had affected testing. | Keep an account-free workshop sample and make versioned media available even when the live language service cannot initialize. |
| [SpookBnB, 2025 third overall](https://devpost.com/software/spookbnb-when-dark-mode-gets-truly-dark) made one familiar UI action reveal a distinct working experience. | Lead with one concrete moment the viewer can reproduce. Hear a phrase, see the translation, and check a Swedish–Arabic term pair. |
| [rumorNet, 2025 Best Frankenstein](https://devpost.com/software/rumornet) organized multilingual analysis around country and language context. [Faxi, 2025 Best Resurrection](https://devpost.com/software/faxi-16iecy) designed a workflow around how seniors already send requests. | Make the workshop task and language pair central to the demo. Explain exactly what each part of the audio workflow contributes. |
| [Upload Drive-In, Code with Kiro first place](https://devpost.com/software/upload-drive-in) focused on a specific file-collection problem and documented installation and developer feedback. | Give judges a direct sample button, a known source clip and exact verification steps. |

[The 2025 panel](https://kiroween-2025.devpost.com/) included machine-learning, developer-education, UX and AWS practitioners. [The 2026 event page](https://kiroween.devpost.com/) lists a qualified panel. Individual preferences and scores are unavailable. In [a 2025 public forum exchange](https://kiroween-2025.devpost.com/forum_topics/42949-request-for-clarification-on-kiroween-hackathon-evaluation-criteria), the organizer said it could not give individual feedback. The official 2026 rules permit judges to assess the described and filmed evidence without opening the app, so the film includes a full workflow and the exact recovery evidence.

## Research and product choices

- The [WMT 2026 terminology task](https://aclanthology.org/2026.wmt-main.51/) studies finding and using specialized terms. [AMTA's terminology evaluation study](https://aclanthology.org/2026.amta-research.7/) also finds that strict glossary enforcement can suppress valid translation variants. VoxBridge provides a small bilingual workshop reference alongside the caption. The recognized Swedish phrase controls which term appears, and Chrome still supplies the caption.
- [SimulEval](https://aclanthology.org/2020.emnlp-demos.19/) treats translation quality and latency as separate dimensions. VoxBridge translates finalized phrases. A future study should measure time from end of speech to first Arabic caption and to first spoken Arabic, alongside a human review of terminology. There is no measured latency or translation accuracy claim in the submission.
- [YouTube's automatic dubbing](https://support.google.com/youtube/answer/15569972?hl=en) creates selectable published audio tracks for eligible videos. VoxBridge's workflow is a listener-controlled desktop tab share, bilingual captions, and a workshop reference. Its sample demonstrates independent playback speed and listening modes.

## What the judge can verify

| Requirement | Check or evidence |
| --- | --- |
| Category and functional platform | Frankenstein. Open the sample on desktop or mobile. Use desktop Chrome for the supported live path. |
| Meaningful Kiro use | The requirements, steering, implementation changes, browser regressions and executed save hook are linked in [KIRO.md](KIRO.md). |
| Public source and open-source license | Public GitHub repository, root [MIT license](LICENSE), and tracked [.kiro directory](.kiro/). |
| English materials and test access | [Submission text and judge steps](SUBMISSION.md), no login for the sample, and the workshop source clip linked there. Keep the public app accessible through the judging period, which ends January 29, 2027 at 1:00 p.m. Pacific. |
| Video | English narration and captions for the demonstrated phrases. Review the current release MP4 and the media notes in [AUDIT.md](AUDIT.md). Confirm the YouTube link works for a signed-out viewer before sending Devpost. |
| Entrant eligibility and ownership | The repository is separate from Car Care Sverige. The entrant confirms residency, eligibility, ownership, any prior work incorporated, and team details. Team entrants may have up to three eligible individuals and need an authorized representative. |
| Formal entry | Record the public YouTube URL and Devpost receipt when they exist. Submission closes December 4, 2026 at 23:00 in Sweden. |

The [official 2026 rules](https://kiroween.devpost.com/rules) screen for category fit and meaningful Kiro use before scoring potential impact, technical implementation, design, innovation and presentation equally. The main entry is Frankenstein. Additional prizes with separate proofs, such as a startup, student, Crew, blog or social entry, should be selected only if the entrant qualifies and supplies the required evidence.

## Product direction after the contest

Start with a small consented pilot in a Swedish workshop or vocational training program. Ask users to complete a briefing from a known set of Swedish phrases. Compare term accuracy, time to understand the briefing, and replay frequency. A company-managed glossary and recurring onboarding packs are plausible future paid capabilities. Monthly pricing, generalization to other workplaces, and reliability for critical instructions require validation.
