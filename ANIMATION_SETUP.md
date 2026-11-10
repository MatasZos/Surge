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


## Overlord and Dual Barrel artwork update

The new animation code supports two higher-detail sprite sheets:

```text
public/assets/animations/overlord_v3.png
public/assets/animations/dualbarrel_v3.png
```

Extract the `public` directory from `SURGE_Realistic_Boss_DualBarrel_Assets.zip` into your repository root and commit the new PNG files to this branch.

The Overlord atlas is a 7-column, 5-row sheet of 256 × 256 frames:
idle 0–6, shield 7–13, attack 14–20, summon 21–27, death 28–34.

The Dual Barrel atlas is a 7-column, 4-row sheet of 256 × 256 frames:
idle 0–6, alternating muzzle-fire 7–13, cooldown 14–20.

The code selects these new atlases when present. Without them, it uses the earlier PNG atlases. The old procedurally drawn flat Overlord has been removed.

Dual Barrel attacks always issue two projectiles from separate muzzle positions, with the firing frames 2 and 4 of the attack sequence controlling their release. Gameplay balance values remain in the CSV files.
