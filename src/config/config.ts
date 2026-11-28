import { SETTINGS } from "./settings.ts";

const CONFIG_FILE = "config/gameplay.csv";

export async function loadConfig(): Promise<void> {
    let text: string;

    try {
        const response = await fetch(CONFIG_FILE, { cache: "no-store" });
        if (!response.ok) return;
        text = await response.text();
    } catch {
        return;
    }

    // Skip the header line and blank lines.
    const lines = text.split(/\r?\n/);

    for (let index = 1; index < lines.length; index++) {
        const line = lines[index].trim();
        if (line === "") continue;

        const [name, value] = line.split(",");
        applySetting(name.trim(), Number(value));
    }
}

function applySetting(name: string, value: number): void {
    const path = name.split(".");
    const key = toCamelCase(path.pop() ?? "");
    const group = findSettingsGroup(path);

    if (!key || !group || typeof group[key] !== "number") {
        return;
    }

    if (!Number.isFinite(value)) {
        return;
    }

    group[key] = value;
}

function findSettingsGroup(path: string[]): Record<string, unknown> | undefined {
    let group: Record<string, unknown> = SETTINGS;

    for (const part of path) {
        const next = group[toCamelCase(part)];
        if (typeof next !== "object" || next === null) return undefined;
        group = next as Record<string, unknown>;
    }

    return group;
}

function toCamelCase(word: string): string {
    return word.replace(/_([a-z0-9])/g, (_match, letter: string) => letter.toUpperCase());
}
