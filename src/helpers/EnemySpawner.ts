import Phaser from "phaser";
import { SETTINGS } from "../config/settings.ts";
import { CELL_WIDTH, GRID_COLS, GRID_ROWS, GRID_X } from "../constants.ts";
import type { Defender } from "../defenders/Defender.ts";
import { CrusherEnemy } from "../enemies/CrusherEnemy.ts";
import { DroneEnemy } from "../enemies/DroneEnemy.ts";
import type { Enemy } from "../enemies/Enemy.ts";
import { HijackerEnemy } from "../enemies/HijackerEnemy.ts";
import { MeleeEnemy } from "../enemies/MeleeEnemy.ts";
import { RangedEnemy } from "../enemies/RangedEnemy.ts";
import { getRowCenterY } from "../grid/GridPosition.ts";
import type { EnemyType, WaveManager } from "../managers/WaveManager.ts";
import type { Stronghold } from "../objects/Stronghold.ts";

export class EnemySpawner {
    constructor(
        private scene: Phaser.Scene,
        private enemies: Enemy[],
        private defenders: Defender[],
        private stronghold: Stronghold,
        private waveManager: WaveManager,
        private onHijackerTarget: (hijacker: HijackerEnemy, target: Defender) => void
    ) {}

    spawnEnemy(): boolean {
        const enemyType = this.waveManager.chooseEnemyType();
        if (enemyType === null) return false;

        const row = Phaser.Math.Between(0, GRID_ROWS - 1);
        const x = GRID_X + GRID_COLS * CELL_WIDTH + 50;
        const y = getRowCenterY(row);
        const enemy = this.createEnemy(enemyType, x, y);

        const level = this.waveManager.getCurrentLevel();
        const healthMultiplier = 1 + (level - 1) * SETTINGS.waves.enemyHealthIncreasePerLevel;
        const damageMultiplier = 1 + (level - 1) * SETTINGS.waves.enemyDamageIncreasePerLevel;
        enemy.applyLevelDifficulty(healthMultiplier, damageMultiplier);

        this.enemies.push(enemy);
        this.waveManager.enemySpawned(enemyType);
        enemy.setData("waveEnemyType", enemyType);

        enemy.once("destroy", () => {
            if (enemy.health <= 0) {
                this.waveManager.enemyDefeated(enemyType);
            }
        });
        return true;
    }

    private createEnemy(type: EnemyType, x: number, y: number): Enemy {
        switch (type) {
            case "melee":
                return new MeleeEnemy(this.scene, x, y);
            case "crusher":
                return new CrusherEnemy(this.scene, x, y);
            case "drone":
                return new DroneEnemy(this.scene, x, y);
            case "hijacker":
                return this.createHijacker(x);
            case "ranged":
                return new RangedEnemy(this.scene, x, y, this.defenders, this.stronghold);
        }
    }

    private createHijacker(spawnX: number): HijackerEnemy {
        const targets: Defender[] = [];
        for (const defender of this.defenders) {
            if (defender.active) targets.push(defender);
        }

        let target: Defender | undefined;
        if (targets.length > 0) {
            const index = Phaser.Math.Between(0, targets.length - 1);
            target = targets[index];
        }

        const x = target?.x ?? spawnX;
        const hijacker = new HijackerEnemy(this.scene, x, -60, SETTINGS.enemies.hijacker.health);
        if (target) {
            this.onHijackerTarget(hijacker, target);
        } else {
            hijacker.cancelGrab();
        }
        return hijacker;
    }
}
