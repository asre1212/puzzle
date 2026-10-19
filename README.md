# Wordgarden

An offline-ready puzzle PWA: daily five-letter word game, unlimited word practice, Sudoku, and Word Ladder. Includes a generated gameboard home-screen icon.

## Play

Live app: https://wordgarden-daily.savorymug256.chatgpt.site

On iPhone, open in Safari → Share → Add to Home Screen. Wait for **Ready offline** before disconnecting. The first visit requires a connection. Private Sites hosting may require owner sign-in for online access.

- 1,007 independently curated answer words; 15,923 accepted guesses.
- Six attempts with correct duplicate-letter scoring and keyboard feedback.
- Daily puzzles change at midnight America/New_York, including daylight saving time.
- Unlimited practice avoids today's answer and the last 20 practice words when possible.
- Daily results, current/best streak, guess distribution, and separate practice totals.
- Local browser storage; JSON export/restore; explicit confirmation before replacement/reset.
- Accessible color mode with symbols, screen-reader labels, reduced motion.
- Service-worker offline cache; native sharing or clipboard fallback.
- Sudoku: generated 9×9 boards with verified unique solutions, two clue levels, pencil notes, undo, hints, conflict highlighting, and automatic saves.
- Word Ladder: four-letter transformations, validated moves, common-word generated routes, undo, hints, and automatic saves.
- Automatic update check on opening, foregrounding, and reconnection. An asset-hash revision ensures each changed release gets a fresh offline cache; failed downloads leave the current worker active.
- Progress is stored separately from app caches and retained across updates. Backups include all games, unfinished guesses, Sudoku notes, and history. Old Phase 1 backups migrate automatically.
- Best-effort persistent-storage request; this cannot prevent manual data clearing.
- No analytics, external fonts, runtime API calls, or AI inference. Hosting access logs may apply.

## Run / test

No dependencies or build step. Serve `dist/` with an HTTP server for development; production requires HTTPS for service workers. Run `node scripts/stamp-version.mjs` and `npm test` (Node 20+). Never open index.html directly with file://.

## GitHub Pages

All deployable files are in `dist/`. The included Pages workflow stamps the release, tests, enables Pages when permissions allow, and uploads that folder. If initial Pages enablement is refused, select **Settings → Pages → Source: GitHub Actions**, then rerun **Deploy puzzle app**. The default live deployment above is separate; changes on GitHub do not automatically update the Sites copy.

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

## Hugging Face

Not needed for Phase 1: dictionary membership and tile scoring are exact local algorithms. No model downloads or paid API keys are required. Future semantic puzzle modules can use precomputed embeddings or a tested opt-in Transformers.js model; keep scoring independent of language generation.

## Verification

15 automated checks cover duplicate-letter consumption, 6-attempt outcomes, Eastern midnight/DST, daily schedule stability, streak gaps/losses, backup round trips across all games, old-backup migration, malformed data, unique Sudoku generation across 60 boards, 50 generated ladders, manifest assets, automatic update lifecycle and failed-download safety. Interactive Safari/home-screen/browser visual checks were unavailable in the build environment and remain device checks.

## Sources

- Dictionary: https://github.com/dwyl/english-words (Unlicense, retained in dist/credits.html).
- Offline design: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
- Optional later AI: https://huggingface.co/docs/transformers.js/en/index

## Transfer to another phone

1. On the old phone: Settings → Export backup. Save the JSON file to iCloud Files or transfer via AirDrop.
2. On the new phone: open the app, add it to the home screen, then Settings → Restore backup.
3. Select the JSON file and confirm replacement. All game histories, current puzzles, notes, and settings transfer.

Original app implementation and generated artwork. Independent of NYT Wordle.
