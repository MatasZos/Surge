import type Phaser from "phaser";
import { SETTINGS } from "../config/settings.ts";
import type { EnemySpawner } from "./EnemySpawner.ts";
import type { WaveManager } from "../managers/WaveManager.ts";

export class EnemySpawnTimer {
    private timer?: Phaser.Time.TimerEvent;

    constructor(
        private clock: Phaser.Time.Clock,
        private waveManager: WaveManager,
        private spawner: EnemySpawner,
        private canSpawn: () => boolean,
    ) {}

    start(): void {
        this.clock.delayedCall(SETTINGS.waves.firstEnemyDelayMs, () => {
            this.spawnBatch();
            this.startRepeatingTimer();
        });
    }

    updateInterval(): void {
        if (!this.timer || this.timer.delay === this.waveManager.getSpawnIntervalMs()) {
            return;
        }

        this.timer.remove(false);
        this.startRepeatingTimer();
    }

    private startRepeatingTimer(): void {
        this.timer = this.clock.addEvent({
            delay: this.waveManager.getSpawnIntervalMs(),
            callback: () => this.spawnBatch(),
            loop: true,
        });
    }

    private spawnBatch(): void {
        if (!this.canSpawn()) return;

        const batchSize = this.waveManager.getEnemiesPerBatch();
        for (let count = 0; count < batchSize; count++) {
            if (!this.spawner.spawnEnemy()) return;
        }
    }
}
