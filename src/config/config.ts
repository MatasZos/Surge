
import { SETTINGS } from "./settings";

const CONFIG_FILE = "config/gameplay.csv";

export async function loadConfig() {
    let text: string;

    try {
        const response = await fetch(CONFIG_FILE, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        text = await response.text();
    } catch (error) {
        console.warn(`Could not load ${CONFIG_FILE}:`, error);
        return;
    }

    // Skip the header line and blank lines.
    const lines = text.split(/\r?\n/).slice(1)
        .filter(line => line.trim() !== "");

    for (const line of lines) {
        const [name, value] = line.split(",")
            .map(field => field.trim());

        applySetting(name, Number(value));
    }
}

function applySetting(name: string, value: number) {
    const path = name.split(".").map(toCamelCase);
    const key = path.pop();

    let target: Record<string, unknown> | undefined = SETTINGS;

    for (const part of path) {
        const next: unknown = target?.[part];
        target = typeof next === "object" && next !== null
            ? next as Record<string, unknown>
            : undefined;
    }

    if (!key || typeof target?.[key] !== "number") {
        console.warn(`${CONFIG_FILE}: ignoring unknown setting ${name}`);
        return;
    }

    if (!Number.isFinite(value)) {
        console.warn(`${CONFIG_FILE}: ignoring invalid value for ${name}`);
        return;
    }

    target[key] = value;
}

function toCamelCase(word: string) {
    return word.replace(/_([a-z0-9])/g,
        (_match, letter: string) => letter.toUpperCase());
}
