# Sprite animations

The animation code is on this branch. The generated PNG atlases are supplied in the separate animation assets ZIP.

Extract the ZIP's `public` folder into the repository root while this branch is checked out. Do not replace the existing defender or enemy PNG images.

The following files should be present in `public/assets/animations/`:

```text
shooter.png
dualbarrel.png
cryogunner.png
generator.png
landmine.png
scrapper.png
meleeEnemy.png
rangedEnemy.png
crusherEnemy.png
drone.png
hijacker.png
overlord.png
energy.png
fx.png
```

Start the game using `deno task dev` and `deno task serve`.

The sprite sheets contain 192 × 192 frames laid out horizontally. The animation controller automatically selects animations during play. The Barricade remains static.

Gameplay balance and CSV configuration are inherited unchanged from the main branch at the branch's creation. The collision fix on this branch makes projectiles stop damaging enemies after their first impact.

Review in-game visuals and performance before merging. This branch has not been fully playtested.

## Overlord v4 artwork

The new boss sheet uses a 7-column by 5-row grid with 212 × 212 PNG frames. The game looks for `public/assets/animations/overlord_v4.png` and falls back to the previous Overlord sheet when that file is absent.

Animations:

- Idle: frames 0–6
- Shield: frames 7–13
- Attack: frames 14–20
- Summon: frames 21–27
- Death: frames 28–34

No new Dual Barrel artwork is used. The existing Dual Barrel sprite sheet and the two-shot bug fix are retained.
