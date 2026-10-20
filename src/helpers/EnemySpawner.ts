
import Phaser from "phaser";

import { Enemy } from "../enemies/Enemy";
import { MeleeEnemy } from "../enemies/MeleeEnemy";
import { RangedEnemy } from "../enemies/RangedEnemy";
import { CrusherEnemy } from "../enemies/CrusherEnemy";

import { Defender } from "../defenders/Defender";
import { Stronghold } from "../objects/Stronghold";
import { WaveManager } from "../managers/WaveManager";

import {
    GRID_ROWS,
    GRID_COLS,
    CELL_WIDTH,
    CELL_HEIGHT,
    GRID_X,
    GRID_Y
} from "../constants";

export class EnemySpawner {

    constructor(
        private scene: Phaser.Scene,
        private enemies: Enemy[],
        private defenders: Defender[],
        private stronghold: Stronghold,
        private waveManager: WaveManager
    ) {}

    spawnEnemy(): void {

        if (this.waveManager.isWaveFinished()) {
            return;
        }

        const row = Phaser.Math.Between(0, GRID_ROWS - 1);

        const x = GRID_X + GRID_COLS * CELL_WIDTH + 50;
        const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

        const enemyType = this.waveManager.chooseEnemyType();

        let enemy: Enemy;

        if (enemyType === "crusher") {
            enemy = new CrusherEnemy(this.scene, x, y);

        } else if (enemyType === "melee") {
            enemy = new MeleeEnemy(this.scene, x, y);

        } else {
            enemy = new RangedEnemy(
                this.scene,
                x,
                y,
                this.defenders,
                this.stronghold
            );
        }

        this.enemies.push(enemy);
        this.waveManager.enemySpawned();
    }
}
