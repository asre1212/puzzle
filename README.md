# Wordgarden

An offline-ready puzzle PWA: daily five-letter word game, unlimited word practice, Sudoku, Word Ladder, and Semantic Guessing. Includes a generated gameboard home-screen icon.

## Play

GitHub app: https://asre1212.github.io/puzzle/

Alternate hosted copy: https://wordgarden-daily.savorymug256.chatgpt.site

On iPhone, open in Safari → Share → Add to Home Screen. Wait for **Ready offline** before disconnecting. The first visit requires a connection. Private Sites hosting may require owner sign-in for online access.

- 1,007 independently curated answer words; 15,923 accepted guesses.
- Six attempts with correct duplicate-letter scoring and keyboard feedback.
- Daily puzzles change at midnight America/New_York, including daylight saving time.
- Unlimited practice avoids today's answer and the last 20 practice words when possible.
- Daily results, current/best streak, guess distribution, and separate practice totals.
- Separate Hint and Show answer controls in every puzzle. Letter hints do not consume guesses; Sudoku hints fill a cell; ladder hints suggest a next step; semantic hints suggest a closer word. Full reveals require confirmation, persist across reload/backup, and do not count as wins.
- Local browser storage; JSON export/restore; explicit confirmation before replacement/reset.
- Accessible color mode with symbols, screen-reader labels, reduced motion.
- Service-worker offline cache; native sharing or clipboard fallback.
- Sudoku: generated 9×9 boards with verified unique solutions, two clue levels, pencil notes, undo, hints, conflict highlighting, and automatic saves.
- Semantic Guessing: 113 secret words, 6,017 accepted words, meaning-based ranks, unlimited guesses, closer-word hints, and saved progress. Rank #1 solves the puzzle. Roughly 1.9 MB of precomputed data is included in the offline pack; no phone-side model download or AI calls.
- Word Ladder: four-letter transformations, validated moves, common-word generated routes, undo, hints, and automatic saves.
- Three-second animated jigsaw splash: generic plus Halloween, Christmas, New Year, spring, summer, July 4th, Valentine’s Day, and a November 5–10 birthday design. The in-app opening screen switches annually in Eastern time, works offline, can be skipped immediately, and respects both app/device reduced-motion settings. Settings includes previews and the full calendar. It does not change the iOS system launch image.
- Automatic update check on opening, foregrounding, and reconnection. An asset-hash revision ensures each changed release gets a fresh offline cache; failed downloads leave the current worker active.
- Progress is stored separately from app caches and retained across updates. Backups include all games, unfinished guesses, Sudoku notes, and history. Old Phase 1 backups migrate automatically.
- Best-effort persistent-storage request; this cannot prevent manual data clearing.
- No analytics, external fonts, runtime API calls, or AI inference. Hosting access logs may apply.

## Run / test

No dependencies or build step. Serve `dist/` with an HTTP server for development; production requires HTTPS for service workers. Run `node scripts/stamp-version.mjs` and `npm test` (Node 20+). Never open index.html directly with file://.

## GitHub Pages

Pages is configured to **Deploy from a branch → main → / (root)**. The root `index.html` opens `dist/`; `.nojekyll` ensures static assets are published. The installable PWA starts at `/puzzle/dist/` and works offline once cached.

GitHub publishes new pushes through its built-in Pages workflow. `Check puzzle app` validates the code and committed offline cache revision. Before committing app changes, run `node scripts/stamp-version.mjs` and `npm test` so opening an installed app detects the new release.

The alternate Sites deployment is separate. Progress belongs to each origin: use Settings → Export backup / Restore backup to transfer progress from the alternate copy to GitHub.

## Architecture

- `dist/core.js`: pure scoring, day selection, statistics, backup validation.
- `dist/app.js`: UI and local persistence; tab synchronization.
- `dist/words.js`: bundled dictionary and curated answer schedule.
- `dist/sw.js`: versioned offline shell, activates only after the complete new asset pack is cached.
- `scripts/stamp-version.mjs`: content-derived cache revisions; run for every deployment.
- `dist/puzzles.js`: Sudoku generation/solving, word graph, ladder generation, backup validation.
- `dist/puzzle-ui.js`: Sudoku and Word Ladder interfaces.
- `dist/ladder-words.js`: 7,186 accepted ladder words and 915 common route words.
- `dist/manifest.webmanifest`: install metadata; relative paths support `/puzzle/`.
- `tests/`: rule, date, backup, and offline cache checks.

Do not reorder the v1 answer list: that would change past daily puzzles. Introduce a versioned schedule with an explicit cutover for future content updates. The 1,007-day schedule repeats after its full cycle. Locally delivered answers are inspectable; this is a casual single-player game, not an anti-cheat system. Browser storage can be cleared/evicted: export backups periodically. Progress is independent between hosting origins and Safari/home-screen contexts; use backup transfer if needed.

## Splash calendar

| Design | Annual window (Eastern time, inclusive) |
| --- | --- |
| Valentine’s Day | February 7–15 |
| Spring | March 1–May 31 |
| Summer | June 1–August 31 |
| July 4th | June 27–July 7 (overrides summer) |
| Halloween | October 18–November 1 |
| Birthday | November 5–10 |
| Christmas | December 10–26 |
| New Year | December 27–January 3 |
| Generic | All other dates |

The splash closes automatically after exactly 3,000 ms of active execution, or immediately when skipped. Backgrounding closes it; a return after 30 minutes or a theme change shows the current design. Quick reloads within 12 seconds avoid duplicate animation during automatic app updates. Previewing never changes the calendar. Mobile OS suspension can delay JavaScript timers while the app is not visible. The animation and all artwork are small local SVG/CSS assets; no holiday downloads or future publishing jobs are needed.

## Hugging Face

Semantic Guessing uses `Xenova/all-MiniLM-L6-v2` (q8 ONNX; Apache 2.0) via Transformers.js 4.3.1 at build time. Mean-pooled normalized 384-dimensional embeddings produce cosine-similarity ranks. At runtime, the app reads bundled ranks entirely locally. This sentence model gives approximate word associations, sometimes surprising; the rank is within the pack, not all English words. Sources and limitations appear in Credits.

To rebuild the pack (only needed when changing semantic content): install Transformers.js 4.3.1 into `/tmp/semantic-build`, download `google-10000-english-no-swears.txt` from the first20hours/google-10000-english repository to `/tmp/semantic-build/vocabulary.txt`, and run `TRANSFORMERS_MODULE=file:///tmp/semantic-build/node_modules/@huggingface/transformers/dist/transformers.node.mjs node scripts/build-semantic.mjs`. Then run `python scripts/rank-semantic.py` (NumPy required), `node scripts/stamp-version.mjs`, and `npm test`. Intermediate embeddings stay in `/tmp/semantic-build`. Keep existing targets/vocabulary available when extending this pack so older backups remain valid.

## Verification

30 automated checks cover duplicate-letter consumption, 6-attempt outcomes, Eastern midnight/DST, daily schedule stability, streak gaps/losses, backup round trips across all games, old-backup migration, malformed data, unique Sudoku generation across 60 boards, 50 generated ladders, manifest assets, automatic update lifecycle and failed-download safety. Assistance checks cover letter clues, reveal statistics, all-game backup preservation, and invalid assistance metadata. Semantic checks cover complete rank permutations, exact wins, related-word ordering, guess rejection, draft/history restoration, and older-backup migration. Interactive Safari/home-screen/browser visual checks were unavailable in the build environment and remain device checks.

## Sources

- Dictionary: https://github.com/dwyl/english-words (Unlicense, retained in dist/credits.html).
- Offline design: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
- Semantic embeddings: https://huggingface.co/Xenova/all-MiniLM-L6-v2
- Vocabulary: https://github.com/first20hours/google-10000-english
- Build-time AI: https://huggingface.co/docs/transformers.js/en/index

## Transfer to another phone

1. On the old phone: Settings → Export backup. Save the JSON file to iCloud Files or transfer via AirDrop.
2. On the new phone: open the app, add it to the home screen, then Settings → Restore backup.
3. Select the JSON file and confirm replacement. All game histories, current puzzles, notes, and settings transfer.

Original app implementation and generated artwork. Independent of NYT Wordle.
