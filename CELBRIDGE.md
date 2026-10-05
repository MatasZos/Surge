# Surge in Celbridge (Deno)

A Phaser 4 + TypeScript game, built with Deno. Not using Celbridge? See `README_deno_tooling.md`.

## Running it in Celbridge

Open `Surge game.celbridge` in Celbridge. The console at the bottom starts by itself and runs `deno task dev`:

1. **builds** `src/` (TypeScript, plus Phaser from npm) into `dist/app.js`, and copies `public/` (the page, its
   CSS, and the art in `public/assets/`) into `dist/`. Only files that have changed are copied
2. **tests** everything in `tests/`, printing the results in the console and writing a readable report to
   `test_output/index.html`. The report also lists TypeScript errors and lint warnings
3. **watches**: every time you save a file in `src/`, `public/` or `tests/`, it does it all again

`dist/index.html` opens beside the console. After a rebuild, press its preview's **refresh** button to see
your changes. The clipboard icon opens the test report.

The console's buttons: rebuild-and-watch, build once, test once, and lint. To use them while the watcher is
running, press **Ctrl+C** first to stop it.

## Where things go

| Folder | What goes in it |
|---|---|
| `src/` | the game's TypeScript code. `src/main.ts` is where it starts |
| `public/` | `index.html`, and the CSS in `public/css/` |
| `public/assets/` | images, sounds, music. In the game, load them as `assets/...` (no `public/`) |
| `tests/` | tests, in files ending `.test.ts` |

## Lint warnings

The lint button (and the test report) currently shows 10 warnings:

- **7 × `no-sloppy-imports`**: local imports without `.ts`, e.g. `import { Grid } from "./grid/Grid"`. Adding
  `.ts` (`"./grid/Grid.ts"`) fixes them.
- **3 × `no-explicit-any`**: replace `any` with the real type.

See `README_matt_celbridge_review.md` for the exact fixes.

## Tiled maps

If you make maps in Tiled, convert them to JSON for Phaser with `deno task map <in.tmx> [out.json]`. It does the
same as Tiled's own command line (`tiled --export-map json --embed-tilesets in.tmx out.json`), but doesn't need
Tiled installed.

## Files for the Deno build

You never need to edit these:

- `Surge game.celbridge`: the Celbridge project, with its shortcuts
- `terminal.console`: the console and its buttons
- `deno.json`: the Deno tasks and settings
- `build.ts`, `tools/test_report.ts`: the build and the test report
- `tools/tmx_to_json.ts`: converts Tiled maps to JSON (`deno task map`)
- `README_deno_tooling.md`: how to do all this without Celbridge
- `README_deno_install.md`: how to install Deno on Linux, macOS and Windows
