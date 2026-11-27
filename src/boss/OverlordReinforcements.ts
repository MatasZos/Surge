import Phaser from "phaser";
import { BossEnemy } from "../enemies/BossEnemy.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { MeleeEnemy } from "../enemies/MeleeEnemy.ts";
import { RangedEnemy } from "../enemies/RangedEnemy.ts";
import { CrusherEnemy } from "../enemies/CrusherEnemy.ts";
import { Defender } from "../defenders/Defender.ts";
import { Stronghold } from "../objects/Stronghold.ts";
import { GRID_ROWS } from "../constants.ts";
import { getRowCenterY } from "../grid/GridPosition.ts";

type RobotType = "melee" | "ranged" | "crusher";

export class OverlordReinforcements {
    private summonedEnemies: Enemy[] = [];
    private pending = 0;
    private spawnTimers: Phaser.Time.TimerEvent[] = [];

    constructor(
        private scene: Phaser.Scene,
        private boss: BossEnemy,
        private enemies: Enemy[],
        private defenders: Defender[],
        private stronghold: Stronghold
    ) {}

    spawn(phase: number): void {
        this.clearSpawnTimers();
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

       this.pending = robots.length;

        robots.forEach((type, i) => {
        const timer = this.scene.time.delayedCall(i * 280, () => {

        // Do not spawn if the boss is defeated
        if (!this.boss.active || !this.boss.phases.shieldActive) {
            this.pending--;
            return;
        }

        const row = Phaser.Math.Between(0, GRID_ROWS - 1);
        const x = this.boss.x - this.boss.displayWidth / 2 - 60;
        const y = getRowCenterY(row);

        let enemy: Enemy;

        if (type === "melee") {
            enemy = new MeleeEnemy(this.scene, x, y);
        } else if (type === "ranged") {
            enemy = new RangedEnemy(
                this.scene, x, y,
                this.defenders,
                this.stronghold
            );
        } else {
            enemy = new CrusherEnemy(this.scene, x, y);
        }

        enemy.setDepth(this.boss.depth + 1);

        this.enemies.push(enemy);
        this.summonedEnemies.push(enemy);

        this.pending--;
    });

    this.spawnTimers.push(timer);

  });

    }

        update(): void {
        if (!this.boss.active || !this.boss.phases.shieldActive) {
            return;
        }

        // Wait until all reinforcements have spawned
        if (this.pending > 0 || this.summonedEnemies.length === 0) {
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

    destroy(): void {
        this.clearSpawnTimers();
        this.summonedEnemies = [];
        this.pending = 0;
    }

    private clearSpawnTimers(): void {
        for (const timer of this.spawnTimers) {
            timer.remove(false);
        }

        this.spawnTimers = [];
    }
}

