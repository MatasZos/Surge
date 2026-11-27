import type { WaveManager } from "../managers/WaveManager.ts";
import type { Enemy } from "../enemies/Enemy.ts";
import type { Stronghold } from "../objects/Stronghold.ts";
import type { BossEncounter } from "./BossEncounter.ts";
import type { WaveIntermission } from "./WaveIntermission.ts";

export class WaveProgress {
    constructor(
        private waveManager: WaveManager,
        private intermission: WaveIntermission,
        private boss: BossEncounter,
        private enemies: Enemy[],
        private stronghold: Stronghold,
        private completeLevel: (level: number) => void,
    ) {}

    update(level: number): void {
        if (this.boss.isActive()) {
            if (this.boss.isDefeated()) {
                this.boss.stop();
                this.completeLevel(5);
            }
            return;
        }

        if (this.intermission.isActive() || this.stronghold.health <= 0) {
            return;
        }

        if (!this.waveManager.isWaveFinished()) {
            return;
        }

        for (const enemy of this.enemies) {
            if (enemy.active) {
                return;
            }
        }

        if (!this.waveManager.isLevelComplete()) {
            this.intermission.start();
            return;
        }

        if (level === 5) {
            this.intermission.start(true);
            return;
        }

        this.completeLevel(level);
    }
}
