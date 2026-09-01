# The New Front Page — How Your Arcade Machine Works

**For Cyrus (and Dad) · September 1, 2026 · nanogames.app**

Your website no longer starts with a menu. It starts with **the machine turning
on.** When someone visits nanogames.app, they are standing in front of a giant
arcade cabinet, and their scroll wheel is the controls. Everything they see on
the way down is real: real footage from your games, real names from your
leaderboard, and one real game they can play inside the page itself.

The old front page did not get deleted. It moved to
**nanogames.app/arcade** and works exactly like before.

## The ride, top to bottom

| Stop | What happens |
|---|---|
| POWER ON | The screen flashes like an old CRT degaussing, then the machine boot-checks itself: 8 cartridges loaded, leaderboard link ONLINE, credits FREE PLAY. Every line is true. |
| ATTRACT MODE | A big CRT plays real Aquatic Survival gameplay (that's the boss CINDER on screen). Like a real arcade cabinet begging for quarters. |
| THE AISLE | The page walks sideways past the other seven cabinets. Each one has painted marquee art on top and its own real gameplay running on its screen. |
| HIGH SCORES | Your actual leaderboard. Yes, you're #1 on Elemental Trials with 5,250. There's an empty row labeled YOUR NAME HERE, and a list of boards nobody has claimed yet. It updates live from the database. |
| READY? | Everything goes dark. "PLAYER 1 ... READY?" |
| NANO PILOT | The big one. A real mini-game inside the page: **the scroll wheel is the joystick.** Scrolling steers the little green pilot (the same sprite the Sprite Forge cabinet draws in the aisle) past asteroids. Real collisions, real score. |
| SERVICE MODE | The machine goes quiet and shows its service screen: *"Every game on this machine was designed, coded and shipped by one kid."* Your name is on it. Your NANO PILOT score shows here too. |
| GAME SELECT | Two painted cabinet doors slide open, and there's the real arcade grid. Click a card, play a game. |

## Things worth knowing

- **PRESS START** in the top corner skips straight to the games, for people who
  just want to play.
- The **HI-SCORE ticker** at the top cycles the real top scores. Beat one in a
  real game and the front page will show your name.
- On phones everything works with a thumb: dragging is steering.
- For visitors who turn off motion (an accessibility setting), the videos hold
  still, the pilot sleeps, and everything is still readable.

## For Dad: how it's wired

- The scroll page is authored HTML mounted by `app/page.tsx` as a route, so
  `layout.tsx` still supplies fonts, metadata, GA4, and the scanline/vignette
  overlays. Fragments live in `app/front/`, engine + media in `public/front/`.
- The GAME SELECT grid at the bottom is the **real `GameCard` component fed by
  `lib/games.ts`** — adding game #9 there updates the front page grid and
  `/arcade` automatically. The aisle and its captured clip are the only manual
  additions for a new game (capture rig: scrollcraft build folder
  `~/dev/scrollcraft/builds/nano-games/lab/capture.mjs`).
- Gameplay clips were screen-recorded from the actual games with a scripted
  headless browser. Marquee art, door side-art and the nebula are kie.ai
  generations (no text baked in; all titles are real HTML).
- The leaderboard scenes fetch `/api/leaderboard` on load. If the database ever
  can't answer, the page falls back to a labeled snapshot (Aug 31 2026) instead
  of pretending.
