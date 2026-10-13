
import { runTests, typeCheck } from "./tools/test_report.ts";

// Project folders
const ROOT_DIR = new URL("./", import.meta.url);
const PUBLIC_DIR = new URL("./public/", ROOT_DIR);
const DIST_DIR = new URL("./dist/", ROOT_DIR);
const CONFIG_DIR = new URL("./config/", ROOT_DIR);
const DIST_CONFIG_DIR = new URL("./config/", DIST_DIR);

const started = performance.now();

console.log(
  `\n=== Build started at ${new Date().toLocaleTimeString()} ===`
);

// Create dist folder if it does not exist
await Deno.mkdir(DIST_DIR, { recursive: true });

// Run a Deno command
async function deno(
  args: string[],
  quiet = false
): Promise<boolean> {
  const result = await new Deno.Command(Deno.execPath(), {
    args,
    cwd: ROOT_DIR,
    stdout: quiet ? "piped" : "inherit",
    stderr: quiet ? "piped" : "inherit",
  }).output();

  if (quiet && !result.success) {
    await Deno.stdout.write(result.stdout);
    await Deno.stderr.write(result.stderr);
  }

  return result.success;
}

// 1. Type check
const checked = await typeCheck(ROOT_DIR);

if (!checked.ok) {
  console.log(checked.text);
  console.log(
    "TypeScript found errors (see above) - the page was still built, but may not work"
  );
}

// 2. Bundle TypeScript into dist/app.js
const bundled = await deno(
  [
    "bundle",
    "--quiet",
    "--platform=browser",
    "--format=iife",
    "--output=dist/app.js",
    "src/main.ts"
  ],
  true
);

if (bundled) {
  console.log(
    "Built dist/app.js from src/main.ts (and the files it imports)"
  );
} else {
  console.log("The page could not be built (see above)");
}

// 3. Copy public files into dist
let copied = 0;
let unchanged = 0;

async function copyFolder(from: URL, to: URL): Promise<void> {
  await Deno.mkdir(to, { recursive: true });

  for await (const entry of Deno.readDir(from)) {
    if (entry.isDirectory) {
      await copyFolder(
        new URL(entry.name + "/", from),
        new URL(entry.name + "/", to)
      );
    } else if (entry.name !== ".DS_Store") {
      const source = new URL(entry.name, from);
      const target = new URL(entry.name, to);

      const before = await Deno.stat(source);
      const after = await Deno.stat(target).catch(() => null);

      if (
        after &&
        after.size === before.size &&
        after.mtime?.getTime() === before.mtime?.getTime()
      ) {
        unchanged++;
        continue;
      }

      await Deno.copyFile(source, target);

      if (before.mtime) {
        await Deno.utime(
          target,
          before.atime ?? before.mtime,
          before.mtime
        );
      }

      copied++;
    }
  }
}

await copyFolder(PUBLIC_DIR, DIST_DIR);

console.log(
  `Copied ${copied} file(s) from public/ to dist/ (${unchanged} unchanged)`
);

// 4. Remove old files that no longer exist in public
async function removeOldFiles(
  dist: URL,
  from: URL,
  prefix = ""
): Promise<void> {
  for await (const entry of Deno.readDir(dist)) {
    if (
      prefix + entry.name === "app.js" ||
      entry.name === ".DS_Store"
    ) {
      continue;
    }

    const name = entry.name + (entry.isDirectory ? "/" : "");

    const inPublic = await Deno.stat(new URL(name, from))
      .then(() => true, () => false);

    if (!inPublic) {
      await Deno.remove(new URL(name, dist), {
        recursive: true
      });

      console.log(
        `Removed dist/${prefix}${name} (no longer in public/)`
      );
    } else if (entry.isDirectory) {
      await removeOldFiles(
        new URL(name, dist),
        new URL(name, from),
        prefix + name
      );
    }
  }
}

await removeOldFiles(DIST_DIR, PUBLIC_DIR);

// 5. Copy generated gameplay CSV files into dist/config
await Deno.mkdir(DIST_CONFIG_DIR, { recursive: true });

const configFiles = [
  "enemies.csv",
  "defenders.csv",
  "energy.csv",
  "stronghold.csv",
  "waves.csv",
  "gameplay.csv"
];

for (const file of configFiles) {
  const source = new URL(file, CONFIG_DIR);
  const destination = new URL(file, DIST_CONFIG_DIR);

  await Deno.copyFile(source, destination);

  console.log(
    "Copied config/" + file + " to dist/config/"
  );
}

// Build complete
const builtIn = (
  (performance.now() - started) / 1000
).toFixed(1);

console.log(
  `dist/ is up to date (${builtIn}s) - press refresh on the dist/index.html preview`
);

// 6. Run tests
await runTests(ROOT_DIR, checked);

// Development watcher message
if (Deno.args.includes("--watching")) {
  console.log(
    "\nWatching src/, public/ and tests/ - save a file to rebuild and retest (Ctrl+C to stop)"
  );
}
