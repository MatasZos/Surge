# Surge (team 5): Celbridge / Deno review

Reviewed 2026-10-05 by Matt, at the end of week 3. The project now uses Deno only.

**Code reviewed (week 3):** `main` at `d638a42` (Mon 5 Oct 13:42, Vladbr99: "Changed enemy classes using
inheritance"), the latest code when Matt reviewed it with the team. This branch is based on it, so merging it keeps
all your work.

**New since the first look (at `ec5e1fe`, Fri 2 Oct):** units now have health, damage and speed stats, enemies
attack every second using their own `damage`, and `MeleeEnemy` is a subclass of `Enemy` (see issue 5).

## Summary

The project now builds with Deno only, with Celbridge's tools. The Node/npm build has been removed: Deno runs on
Windows, macOS and Linux, and does the same job. The game builds with `deno task build` and runs correctly from
the result: the grid, the Shooter button and the robot enemy sprite all load, with no errors.

The build's report shows **no TypeScript errors** and **12 lint warnings**. None of them stop the game running,
but there's one real bug in the new attack code (issue 5a).
The repo also had a few housekeeping problems, which have been fixed or are listed below.

## Changes made on this branch

| Change | Why |
|---|---|
| Deleted `Machine Uprising.celbridge` and `SURGE.celbridge`, kept `Surge game.celbridge` | All three were identical. `Surge game.celbridge` was the most recent (added 29 Sep). |
| Added the Deno build and Celbridge tools | See `CELBRIDGE.md`. |
| Removed `package.json`, `package-lock.json`, `tsconfig.json`, `node_modules/` and the Node `build.ts` | Node/npm aren't needed any more. The Deno build is now `build.ts`. |
| Stopped tracking `dist/game.js` in git | It's build output, and `.gitignore` already lists `dist/`, but it had been committed. Every build showed it as changed. |
| `public/index.html` loads `app.js` instead of `game.js` | `app.js` is the file the Deno build produces (the same as the other teams). |
| Added `deno task serve` | Serves `dist/` at http://127.0.0.1:8000, for previewing in a browser without Celbridge. |
| Added `public/fit-to-window.css` | Scales the page to fit the window or Celbridge's preview panel, so the game is never cut off. |

## Working without Celbridge

`README_deno_tooling.md` explains how to get the same set-up without Celbridge. That matters most for **Linux**
users, as there's no Linux version of Celbridge yet, and `README_deno_install.md` covers installing Deno
on Linux (as well as macOS and Windows). It also
suits anyone working in VS Code:

- `deno task dev` builds, tests, and rebuilds `dist/` every time a file in `src/`, `public/` or `tests/` is saved
- `deno task serve`, in a second terminal, serves the game at http://127.0.0.1:8000. Then refresh the browser
  after each rebuild

The game needs the server: opened straight from disk (`file://`), browsers block Phaser from loading its images
and sounds, so it shows a blank screen.

## Issues and recommended actions

### 1. Lint warnings (12)

**a) `no-sloppy-imports` (9): local imports without `.ts`**

`src/main.ts` lines 2-6, `src/grid/Grid.ts:1`, `src/defenders/Shooter.ts` lines 2-3, `src/enemies/MeleeEnemy.ts:2`.
For example:

```ts
import { Grid } from "./grid/Grid";
```

*Recommended:* add `.ts` to local imports:

```ts
import { Grid } from "./grid/Grid.ts";
```

Then the `sloppy-imports` setting can come out of `deno.json`.

**b) `no-explicit-any` (3): grid cells can hold anything**

`src/grid/Cell.ts:2` (`occupant: any`), `src/grid/Cell.ts:8` (`setOccupant(o: any)`), and `src/grid/Grid.ts:26`
(`placeHuman(..., human: any)`). With `any`, TypeScript can't catch mistakes such as placing the wrong kind of
object in a cell.

*Recommended:* cells only ever hold defenders, so say so:

```ts
// src/grid/Cell.ts
import type { Defender } from "../defenders/Defender.ts";

export class Cell {
    occupant: Defender | null;
    // ...
    setOccupant(o: Defender): void {
```

```ts
// src/grid/Grid.ts
placeHuman(row: number, col: number, human: Defender): void {
```

Both fixes together clear all 12 warnings, and the code still type-checks (checked with `deno check` and
`deno lint`).

### 2. Code structure

The `README.md` and `oldreadme.md` plan a structure that the code doesn't follow yet:

- **Nearly all the game is in `src/main.ts`** (354 lines). The planned scene files (`src/scenes/GameScene.ts`,
  `MainMenu.ts`, `GameOver.ts`) and managers (`src/managers/WaveManager.ts`, `EnergyManager.ts`) contain only a
  one-line comment.
- **Enemies are going the right way:** `MeleeEnemy` now extends `Enemy`. Defenders could follow the same pattern
  (`Shooter` already extends `Defender`), with the attack logic moving out of `main.ts` into the classes.

*Recommended:* as the game grows, move the scene out of `main.ts` into `src/scenes/GameScene.ts`, and waves and
energy into the managers. Smaller files are easier for several people to work on without git conflicts.

### 3. Leftover files

- **`my_functions.ts`** (a `sayHello` function) isn't used anywhere. It looks like it's left over from the course
  template.
- **`oldreadme.md`** describes the game under its old name, "Machine Uprising".

*Recommended:* delete `my_functions.ts`, merge anything useful from `oldreadme.md` into `README.md` and delete it.

### 4. The Celbridge preview

Celbridge's side preview loads the game, including its images and sounds, without needing a separate web server
(checked in Celbridge on 5 Oct).

The page now also scales to fit the preview panel. `public/fit-to-window.css` (linked from `public/index.html`)
shrinks the game to fit as the panel is resized, keeping its shape, so nothing is cut off. Mouse clicks still land
in the right place. It's the last stylesheet on the page, so it's easy to remove if you'd rather lay the page out
yourselves.

*Recommended:* nothing needed. If you change the page's layout (e.g. add a heading or a panel), check it still
fits a narrow panel.

### 5. Health, damage and attacks

The latest commits (`5cb94af` and `d638a42`) give units real stats (health, damage, speed), make enemies attack
every second using their own `damage`, and add `MeleeEnemy`, a subclass of `Enemy`. Good progress, and a sensible use of
inheritance. It builds with no type errors, and the game runs.

**a) Bug: the attack timer never stops**

`handleEnemyDefenderCollision()` in `src/main.ts` starts a looping timer (`this.time.addEvent({ ..., loop: true })`)
each time an enemy reaches a defender, but nothing ever removes it. After the defender dies, the old timer keeps
firing every second and setting `enemy.isAttacking = false`. So when the same enemy reaches the next defender:

- each second, the old timer sets `isAttacking` back to `false`
- the next frame, the collision check sees `!enemy.isAttacking`, and starts **another** looping timer

The enemy then attacks once, then twice, then three times a second, and so on, and the timers pile up for the rest
of the game. They also keep running after the enemy itself dies.

*Recommended:* keep the timer, and remove it when either side dies (checked with `deno check`):

```ts
// Attack every second, until the defender or the enemy dies
const attack = this.time.addEvent({
  delay: 1000,
  loop: true,
  callback: () => {
    // Defender or enemy already dead: stop attacking
    if (!defender.active || !enemy.active) {
      enemy.isAttacking = false;
      attack.remove();
      return;
    }

    defender.takeDamage(enemy.damage);

    if (!defender.active) {
      // ... clear the grid cell and the defenders list, as now ...
      enemy.isAttacking = false;
      attack.remove();
    }
  },
});
```

**b) `MeleeEnemy` sets its stats twice**

`Enemy`'s constructor sets health 200, speed 18 and damage 25, then `MeleeEnemy` immediately overwrites them with
100, 50 and 100. It works, but the numbers in `Enemy` are never used, which is confusing.

*Recommended:* pass the stats to `Enemy`'s constructor, e.g. `super(scene, x, y, "enemy", { health: 100, speed:
50, damage: 100 })`, so each subclass says its own stats once. Each new kind of enemy (e.g. a shooter enemy) is
then one short class.

**c) `console.log` on every hit**

`Defender.takeDamage()` and `Enemy.takeDamage()` log every hit to the console, which floods it once several
enemies are attacking. Fine while testing. Remove them, or show health in the game instead (e.g. a small health
bar above each unit).

## Files for the Deno build

`Surge game.celbridge` (replaced), `CELBRIDGE.md`, `README_deno_tooling.md`, `README_deno_install.md`, `terminal.console`, `deno.json`,
`deno.lock`, `build.ts` (replaced), `tools/test_report.ts`, `tools/tmx_to_json.ts`, `tests/README.md`. See
`CELBRIDGE.md` for how to use them in Celbridge, and `README_deno_tooling.md` for how to use them without it.
