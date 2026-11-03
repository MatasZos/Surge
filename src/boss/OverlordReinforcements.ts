
import Phaser from "phaser";
import { BossEnemy } from "../enemies/BossEnemy.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { MeleeEnemy } from "../enemies/MeleeEnemy.ts";
import { RangedEnemy } from "../enemies/RangedEnemy.ts";
import { CrusherEnemy } from "../enemies/CrusherEnemy.ts";
import { Defender } from "../defenders/Defender.ts";
import { Stronghold } from "../objects/Stronghold.ts";
import {
    GRID_X,
    GRID_Y,
    GRID_ROWS,
    GRID_COLS,
    CELL_WIDTH,
    CELL_HEIGHT
} from "../constants.ts";

type RobotType = "melee" | "ranged" | "crusher";

export class OverlordReinforcements {
    private summonedEnemies: Enemy[] = [];

    constructor(
        private scene: Phaser.Scene,
        private boss: BossEnemy,
        private enemies: Enemy[],
        private defenders: Defender[],
        private stronghold: Stronghold
    ) {}

    spawn(phase: number): void {
        this.summonedEnemies = [];

        let robots: RobotType[] = [];

        if (phase === 1) {
            robots = ["melee", "melee", "melee", "melee", "ranged", "ranged"];
        } else if (phase === 2) {
            robots = [
                "melee", "melee", "melee", "melee",
                "ranged", "ranged", "ranged",
                "crusher", "crusher"
            ];
        } else if (phase === 3) {
            robots = [
                "melee", "melee", "melee", "melee", "melee",
                "ranged", "ranged", "ranged", "ranged",
                "crusher", "crusher", "crusher"
            ];
        }

        for (const type of robots) {
            const row = Phaser.Math.Between(0, GRID_ROWS - 1);
            const x = GRID_X + GRID_COLS * CELL_WIDTH + 50;
            const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

            let enemy: Enemy;

            if (type === "melee") {
                enemy = new MeleeEnemy(this.scene, x, y);
            } else if (type === "ranged") {
                enemy = new RangedEnemy(
                    this.scene,
                    x,
                    y,
                    this.defenders,
                    this.stronghold
                );
            } else {
                enemy = new CrusherEnemy(this.scene, x, y);
            }

            this.enemies.push(enemy);
            this.summonedEnemies.push(enemy);
        }
    }

    update(): void {
        if (!this.boss.active || !this.boss.phases.shieldActive) {
            return;
        }

        if (this.summonedEnemies.length === 0) {
            return;
        }

        const allDefeated = this.summonedEnemies.every(
            enemy => enemy.health <= 0
        );

        if (allDefeated) {
            this.summonedEnemies = [];
            this.boss.completeShield();
        }
    }
}
