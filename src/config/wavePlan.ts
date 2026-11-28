export interface WavePlan {
    level: number;
    wave: number;
    budget: number;
    spawnIntervalMs: number;
    enemiesPerBatch: number;
    meleeWeight: number;
    rangedWeight: number;
    crusherWeight: number;
    droneWeight: number;
    hijackerWeight: number;
}

const wavePlans: WavePlan[] = [];

export async function loadWavePlan(): Promise<void> {
    wavePlans.length = 0;

    try {
        const response = await fetch("config/wave_plan.csv", { cache: "no-store" });
        if (!response.ok) return;

        const lines = (await response.text()).trim().split(/\r?\n/);
        for (let index = 1; index < lines.length; index++) {
            const line = lines[index].trim();
            if (line === "") continue;

            const fields = line.split(",");
            if (fields.length !== 10) {
                continue;
            }

            const values: number[] = [];
            let valid = true;
            for (const field of fields) {
                const value = Number(field);
                if (field.trim() === "" || !Number.isFinite(value) || value < 0) {
                    valid = false;
                    break;
                }
                values.push(value);
            }
            for (let column = 0; valid && column < 5; column++) {
                if (!Number.isSafeInteger(values[column]) || values[column] < 1) {
                    valid = false;
                }
            }
            if (!valid) {
                continue;
            }

            const plan: WavePlan = {
                level: values[0],
                wave: values[1],
                budget: values[2],
                spawnIntervalMs: values[3],
                enemiesPerBatch: values[4],
                meleeWeight: values[5],
                rangedWeight: values[6],
                crusherWeight: values[7],
                droneWeight: values[8],
                hijackerWeight: values[9],
            };
            if (findWavePlan(plan.level, plan.wave)) {
                continue;
            }
            wavePlans.push(plan);
        }
    } catch {
        return;
    }
}

export function findWavePlan(level: number, wave: number): WavePlan | undefined {
    for (const plan of wavePlans) {
        if (plan.level === level && plan.wave === wave) return plan;
    }
    return undefined;
}
