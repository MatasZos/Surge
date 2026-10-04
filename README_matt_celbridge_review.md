# Surge (team 5): Celbridge / Deno review

Reviewed 2026-10-05 by Matt.

## Summary

Celbridge's Deno tools were added to this project, alongside the existing Node/npm build (`build.ts`,
`npm run dev`, `npm run build`), which was not changed. The game builds with `deno task build` and runs
correctly from the result: the grid, the Shooter button and the robot enemy sprite all load, with no errors.

The Deno build's report shows **no TypeScript errors** and **10 lint warnings**. None of them stop the game
running. The repo also had a few housekeeping problems, which have been fixed or are listed below.

## Changes made on this branch

| Change | Why |
|---|---|
| Deleted `Machine Uprising.celbridge` and `SURGE.celbridge`, kept `Surge game.celbridge` | All three were identical. `Surge game.celbridge` was the most recent (added 29 Sep). |
| Stopped tracking `dist/game.js` in git (`git rm --cached`) | It's build output, and `.gitignore` already lists `dist/`, but it had been committed. Every build showed it as changed. |
| Stopped tracking `node_modules/` in git (152 files) | It's installed by `npm install`, and `.gitignore` already lists it. The committed copy was only part of it, and esbuild's files only work on the operating system they were installed on. |
| Added the Deno build and Celbridge tools | See `CELBRIDGE.md`. |

Both files are still on disk. Git just no longer tracks them.

**After this is merged:** anyone using the npm build needs to run `npm install` first. The Deno build doesn't use
`node_modules/`.

## Issues and recommended actions

### 1. Lint warnings (10)

**a) `no-sloppy-imports` (7): local imports without `.ts`**

`src/main.ts` lines 2-5, `src/grid/Grid.ts:1`, `src/defenders/Shooter.ts` lines 2-3. For example:

```ts
import { Grid } from "./grid/Grid";
```

*Recommended:* add `.ts` to local imports:

```ts
import { Grid } from "./grid/Grid.ts";
```

The npm build accepts this too (`allowImportingTsExtensions` is already on in `tsconfig.json`), and so do Deno and
Celbridge without any extra settings.

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

Both fixes together clear all 10 warnings, and the code still type-checks (checked with `deno check` and
`deno lint`).

### 2. Code structure

The `README.md` and `oldreadme.md` plan a structure that the code doesn't follow yet:

- **Nearly all the game is in `src/main.ts`** (299 lines). The planned scene files (`src/scenes/GameScene.ts`,
  `MainMenu.ts`, `GameOver.ts`) and managers (`src/managers/WaveManager.ts`, `EnergyManager.ts`) contain only a
  one-line comment.
- **`src/enemies/MeleeEnemy.ts` is empty**, although a commit message says the melee enemy class was added. The
  melee behaviour seems to be in `src/main.ts` and `Enemy.ts` instead.

*Recommended:* as the game grows, move the scene out of `main.ts` into `src/scenes/GameScene.ts`, and waves and
energy into the managers. Smaller files are easier for several people to work on without git conflicts.

### 3. Leftover files

- **`my_functions.ts`** (a `sayHello` function) isn't used anywhere. It looks like it's left over from the course
  template.
- **`oldreadme.md`** describes the game under its old name, "Machine Uprising".
- **`package.json`** is still named `ts101-part03`, from the template.

*Recommended:* delete `my_functions.ts`, merge anything useful from `oldreadme.md` into `README.md` and delete it,
and rename the package to `surge`.

### 4. Both builds write to `dist/`

`deno task build` and `npm run build` both write `dist/game.js`, so whichever ran last is what you see.

*Recommended:* fine. They build the same code the same way.

### 5. Not yet checked inside Celbridge itself

The build was tested through a local web server, not in Celbridge's side preview.

*Recommended:* open `Surge game.celbridge` and check the game appears in the side preview, and that the sprites
load.

## Files added for the Deno build

`Surge game.celbridge` (replaced), `CELBRIDGE.md`, `terminal.console`, `deno.json`, `deno.lock`, `deno_build.ts`,
`tools/test_report.ts`, `tools/tmx_to_json.ts`, `tests/README.md`. The only other existing file changed is
`.gitignore` (added `test_output/`). See `CELBRIDGE.md` for how to use them.
