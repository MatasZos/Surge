# Surge in Celbridge (Deno)

This project can be built two ways. Both use the same `src/` and `public/`.

| | Celbridge / Deno | Node / npm |
|---|---|---|
| Needs | [Deno](https://deno.com) | [Node.js](https://nodejs.org), then `npm install` |
| Build script | `deno_build.ts` | `build.ts` |
| Build, and rebuild on save | `deno task dev` | `npm run dev` |
| Build once | `deno task build` | `npm run build` |
| Output | `dist/game.js` + `public/` | `dist/game.js` + `public/` |

Both builds write to `dist/`, so the last one you ran wins.

## Running it in Celbridge

Open `Surge game.celbridge` in Celbridge. The console at the bottom starts by itself and runs `deno task dev`:

1. **builds** `src/` (TypeScript, plus Phaser from npm) into `dist/game.js`, and copies `public/` (the page, its
   CSS, and the art in `public/assets/`) into `dist/`. Only files that have changed are copied
2. **tests** everything in `tests/`, printing the results in the console and writing a readable report to
   `test_output/index.html`. The report also lists TypeScript errors and lint warnings
3. **watches**: every time you save a file in `src/`, `public/` or `tests/`, it does it all again

`dist/index.html` opens beside the console. After a rebuild, press its preview's **refresh** button to see
your changes. The clipboard icon opens the test report.

The console's buttons: rebuild-and-watch, build once, test once, and lint. To use them while the watcher is
running, press **Ctrl+C** first to stop it.

## Lint warnings

The lint button (and the test report) currently shows 10 warnings:

- **7 × `no-sloppy-imports`**: local imports without `.ts`, e.g. `import { Grid } from "./grid/Grid"`. Adding
  `.ts` (`"./grid/Grid.ts"`) fixes them, and the npm build accepts it too (`allowImportingTsExtensions` is on in
  `tsconfig.json`).
- **3 × `no-explicit-any`**: replace `any` with the real type.

## Tiled maps

If you make maps in Tiled, convert them to JSON for Phaser with `deno task map <in.tmx> [out.json]`. It does the
same as Tiled's own command line (`tiled --export-map json --embed-tilesets in.tmx out.json`), but doesn't need
Tiled installed.

## Files added for the Deno build

You never need to edit these:

- `Surge game.celbridge`: the Celbridge project, with its shortcuts
- `terminal.console`: the console and its buttons
- `deno.json`: the Deno tasks and settings (Phaser comes from npm, the same version as `package.json`)
- `deno_build.ts`, `tools/test_report.ts`: the build and the test report
- `tools/tmx_to_json.ts`: converts Tiled maps to JSON (`deno task map`)
- `tests/`: put tests here, in files ending `.test.ts`
